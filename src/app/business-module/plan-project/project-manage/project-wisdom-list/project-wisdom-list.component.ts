import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {SliderCommon} from '../../../../core-module/model/slider-common';
import {HIDDEN_SLIDER_HIGH_CONST, SHOW_SLIDER_HIGH_CONST} from '../../../facility/share/const/facility-common.const';
import {PageModel} from '../../../../shared-module/model/page.model';
import {TableConfigModel} from '../../../../shared-module/model/table-config.model';
import {FilterCondition, QueryConditionModel, SortCondition} from '../../../../shared-module/model/query-condition.model';
import {CommonLanguageInterface} from '../../../../../assets/i18n/common/common.language.interface';
import {PlanProjectLanguageInterface} from '../../../../../assets/i18n/plan-project/plan-project.language.interface';
import {TableComponent} from '../../../../shared-module/component/table/table.component';
import {WisdomPointInfoModel} from '../../share/model/wisdom-point-info.model';
import {LanguageEnum} from '../../../../shared-module/enum/language.enum';
import {NzI18nService} from 'ng-zorro-antd';
import {PlanningListTableUtil} from '../../share/util/planning-list-table.util';
import {PointStatusEnum} from '../../share/enum/point-status.enum';
import {ResultCodeEnum} from '../../../../shared-module/enum/result-code.enum';
import {PlanProjectApiService} from '../../share/service/plan-project.service';
import {PointStatusIconEnum} from '../../share/enum/point-status-icon.enum';
import {Router} from '@angular/router';
import {FiLinkModalService} from '../../../../shared-module/service/filink-modal/filink-modal.service';
import * as _ from 'lodash';
import {SliderConfigModel} from '../../../facility/share/model/slider-config.model';
import {ListExportModel} from '../../../../core-module/model/list-export.model';
import {ExportRequestModel} from '../../../../shared-module/model/export-request.model';
import {OperatorEnum} from '../../../../shared-module/enum/operator.enum';
import {ResultModel} from '../../../../shared-module/model/result.model';

@Component({
  selector: 'app-project-wisdom-list',
  templateUrl: './project-wisdom-list.component.html',
  styleUrls: ['./project-wisdom-list.component.scss']
})
export class ProjectWisdomListComponent implements OnInit {

  // 表格实列
  @ViewChild('tableComponent') tableComponent: TableComponent;
  // 智慧杆状态
  @ViewChild('pointStatusTemp') pointStatusTemp: TemplateRef<HTMLDocument>;
  // 滑块配置
  public sliderConfig: Array<SliderCommon> = [];
  // 项目智慧杆列表数据源
  // public dataSet: WisdomPointInfoModel[] = [];
  public dataSet = [];
  // 项目智慧杆列表分页实体
  public pageBean: PageModel = new PageModel();
  // 项目智慧杆列表配置
  public tableConfig: TableConfigModel;
  // 项目智慧杆列表查询条件
  public queryCondition: QueryConditionModel = new QueryConditionModel();
  // 公共语言包国际化
  public commonLanguage: CommonLanguageInterface;
  // 项目规划语言包
  public language: PlanProjectLanguageInterface;
  // 智慧杆状态枚举
  public pointStatusEnum = PointStatusEnum;
  // 国际化枚举
  public languageEnum = LanguageEnum;
  // 列表勾选的智慧杆
  public selectWisdomData: WisdomPointInfoModel[] = [];

  constructor(
    public $nzI18n: NzI18nService,
    private $router: Router,
    private $message: FiLinkModalService,
    // 项目接口
    private $planProjectApiService: PlanProjectApiService
  ) {
  }

  ngOnInit() {
    this.language = this.$nzI18n.getLocaleData(LanguageEnum.planProject);
    this.commonLanguage = this.$nzI18n.getLocaleData(LanguageEnum.common);
    // 加载表格配置
    this.initTableConfig();
    this.refreshData();
    this.sliderConfig = [
      {
        // 智慧杆总数
        label: this.language.wisdomSum,
        iconClass: 'fiLink-work-order-all wisdom-sum',
        textClass: 'wisdom-sum',
        code: null, sum: 0
      },
      // 待建
      {
        label: this.language.toBeBuilt,
        iconClass: PointStatusIconEnum.runnable,
        textClass: 'to-be-built',
        code: PointStatusEnum.toBeBuilt, sum: 0
      },
      // 在建
      {
        label: this.language.underConstruction,
        iconClass: PointStatusIconEnum.running,
        textClass: 'under-construction',
        code: PointStatusEnum.underConstruction, sum: 0
      },
      //   已建
      {
        label: this.language.hasBeenBuilt,
        iconClass: PointStatusIconEnum.end,
        textClass: 'has-been-built',
        code: PointStatusEnum.hasBeenBuilt, sum: 0
      },
    ];
    // 统计各状态项目数
    this.queryProjectPoleStatistics();
  }

  /**
   * 选中卡片查询相应的类型
   * param event
   */
  public sliderChange(event: SliderConfigModel): void {
    if (event.code) {
      // 先清空表格里面的查询条件
      this.tableComponent.searchDate = {};
      this.tableComponent.rangDateValue = {};
      this.tableComponent.tableService.resetFilterConditions(this.tableComponent.queryTerm);
      this.tableComponent.handleSetControlData('pointStatus', [event.code]);
      this.tableComponent.handleSearch();
    } else {
      this.tableComponent.handleRest();
    }
  }

  /**
   * 滑块变化
   * param event
   */
  public slideShowChange(event: SliderConfigModel) {
    if (event) {
      this.tableConfig.outHeight = SHOW_SLIDER_HIGH_CONST;
    } else {
      this.tableConfig.outHeight = HIDDEN_SLIDER_HIGH_CONST;
    }
    this.tableComponent.calcTableHeight();
  }

  /**
   * 分页回调
   * param event
   */
  public pageChange(event: PageModel): void {
    this.queryCondition.pageCondition.pageSize = event.pageSize;
    this.queryCondition.pageCondition.pageNum = event.pageIndex;
    this.refreshData();
  }

  /**
   * 初始化项目智慧杆列表
   */
  private initTableConfig() {
    const columnConfig = PlanningListTableUtil.getWisdomColumnConfig(this, this.$nzI18n);
    columnConfig.splice(-1, 0, {
      // 所属项目
      title: this.language.belongProject, key: 'projectName', width: 150,
      isShowSort: true,
      searchable: true,
      configurable: true,
      searchConfig: {type: 'input'}
    });
    this.tableConfig = {
      isDraggable: true,
      isLoading: true,
      outHeight: 108,
      primaryKey: 'planProjectWisdomList',
      keepSelected: true,
      selectedIdKey: 'projectId',
      showSearchSwitch: true,
      scroll: {x: '1804px', y: '340px'},
      noIndex: true,
      showSearchExport: true,
      columnConfig: columnConfig,
      topButtons: [
        { // 更新状态
          text: '更新状态',
          iconClassName: 'fiLink-refresh-index',
          confirmContent: this.language.confirmPointStatusInfo,
          confirmTitle: this.language.ifUpdateStatus,
          needConfirm: true,
          handle: () => {
            this.updateProjectStatus(this.selectWisdomData.map(item => item.pointId));
          }
        },
      ],
      operation: [
        { // 定位
          text: '定位',
          className: 'fiLink-location',
          handle: () => {
          }
        },
        { // 编辑智慧杆
          text: this.commonLanguage.edit,
          className: 'fiLink-edit',
          handle: (event: WisdomPointInfoModel) => {
            this.checkPointCanUpdate(event.pointId);
          }
        },
        { // 更新状态
          text: '更新状态',
          className: 'fiLink-refresh-index',
          canDisabled: true,
          confirmContent: this.language.confirmPointStatusInfo,
          confirmTitle: this.language.ifUpdateStatus,
          needConfirm: true,
          handle: (event) => {
            this.updateProjectStatus([event.pointId]);
          }
        },
      ],
      // 勾选
      handleSelect: (event: WisdomPointInfoModel[]) => {
        this.selectWisdomData = event;
      },
      sort: (event: SortCondition) => {
        this.queryCondition.sortCondition = event;
        this.refreshData();
      },
      // 筛选搜索
      handleSearch: (e: FilterCondition[]) => {
        this.queryCondition.pageCondition.pageNum = 1;
        this.queryCondition.filterConditions = e;
        this.refreshData();
      },
      // 导出
      handleExport: (event: ListExportModel<any>) => {
        // 获取导出的数据和文件格式
        const exportData = new ExportRequestModel(event.columnInfoList, event.excelType);
        //  处理选中的数据
        if (event && !_.isEmpty(event.selectItem)) {
          const pointIds = event.selectItem.map(item => item.pointId);
          exportData.queryCondition.filterConditions = exportData.queryCondition.filterConditions.concat([new FilterCondition('pointId', OperatorEnum.in, pointIds)]);
        } else {
          exportData.queryCondition.filterConditions = event.queryTerm;
        }
        // 导出接口
        this.$planProjectApiService.exportProjectPoleList(exportData).subscribe((res: ResultModel<string>) => {
          if (res.code === ResultCodeEnum.success) {
            this.$message.success(res.msg);
          } else {
            this.$message.error(res.msg);
          }
        });
      }
    };
  }

  /**
   * 更新点位状态
   * @param data 点位集合
   */
  private updateProjectStatus(data: string[]): void {
    this.$planProjectApiService.updateProjectStatus(data).subscribe((result) => {
      if (result.code === ResultCodeEnum.success) {
        this.$message.success(result.msg);
        this.refreshData();
      } else {
        this.$message.error(result.msg);
      }
    });
  }

  /**
   *  校验项目智慧杆点位能否修改
   * @param id 智慧杆点位id
   */
  private checkPointCanUpdate(id): void {
    this.$planProjectApiService.checkPointCanUpdate(id).subscribe((result) => {
      if (result.code === ResultCodeEnum.success && result.data) {
        this.$router.navigate(['business/plan-project/project-wisdom-detail/update'],
          {queryParams: {id: id}}).then();
      } else {
        this.$message.error(result.msg);
      }
    });
  }

  /**
   * 刷新项目智慧杆列表
   */
  private refreshData(): void {
    this.tableConfig.isLoading = true;
    this.$planProjectApiService.queryProjectPoleByPage(this.queryCondition).subscribe((res) => {
      this.tableConfig.isLoading = false;
      if (res.code === ResultCodeEnum.success) {
        this.dataSet = res.data || [];
        this.dataSet.forEach(item => {
          item.statusIconClass = PointStatusIconEnum[item.pointStatus];
        });
        this.pageBean.pageIndex = res.pageNum;
        this.pageBean.Total = res.totalCount;
        this.pageBean.pageSize = res.size;
      }
    });
  }

  /**
   * 项目智慧杆统计
   */
  private queryProjectPoleStatistics(): void {
    this.$planProjectApiService.queryProjectPoleStatistics().subscribe((result) => {
      if (result.code === ResultCodeEnum.success) {
        this.sliderConfig.forEach(item => {
          const temp = result.data.find(_item => _item.pointStatus === item.code);
          if (temp) {
            item.sum = temp.pointCount;
          }
        });
        this.sliderConfig[0].sum = _.sumBy(result.data, 'pointCount') || 0;
      }
    });
  }
}
