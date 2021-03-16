import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {TableConfigModel} from '../../../../shared-module/model/table-config.model';
import {PageModel} from '../../../../shared-module/model/page.model';
import {PlanProjectLanguageInterface} from '../../../../../assets/i18n/plan-project/plan-project.language.interface';
import {CommonLanguageInterface} from '../../../../../assets/i18n/common/common.language.interface';
import {FilterCondition, QueryConditionModel, SortCondition} from '../../../../shared-module/model/query-condition.model';
import {LanguageEnum} from '../../../../shared-module/enum/language.enum';
import {ListExportModel} from '../../../../core-module/model/list-export.model';
import {NzI18nService} from 'ng-zorro-antd';
import {SliderCommon} from '../../../../core-module/model/slider-common';
import {SliderConfigModel} from '../../../facility/share/model/slider-config.model';
import {HIDDEN_SLIDER_HIGH_CONST, SHOW_SLIDER_HIGH_CONST} from '../../../facility/share/const/facility-common.const';
import {TableComponent} from '../../../../shared-module/component/table/table.component';
import {ResultModel} from '../../../../shared-module/model/result.model';
import {PlanApiService} from '../../share/service/plan-api.service';
import {WisdomPointInfoModel} from '../../share/model/wisdom-point-info.model';
import {ExportRequestModel} from '../../../../shared-module/model/export-request.model';
import {IS_TRANSLATION_CONST} from '../../../../core-module/const/common.const';
import {OperatorEnum} from '../../../../shared-module/enum/operator.enum';
import {ResultCodeEnum} from '../../../../shared-module/enum/result-code.enum';
import {FiLinkModalService} from '../../../../shared-module/service/filink-modal/filink-modal.service';
import * as _ from 'lodash';
import {FacilityListModel} from '../../../../core-module/model/facility/facility-list.model';
import {Router} from '@angular/router';
import {PointStatusEnum} from '../../share/enum/point-status.enum';
import {PointStatusIconEnum} from '../../share/enum/point-status-icon.enum';
import {CommonUtil} from '../../../../shared-module/util/common-util';
import {SelectModel} from '../../../../shared-module/model/select.model';

/**
 * 规划智慧杆列表
 */
@Component({
  selector: 'app-plan-wisdom-list',
  templateUrl: './plan-wisdom-list.component.html',
  styleUrls: ['./plan-wisdom-list.component.scss']
})
export class PlanWisdomListComponent implements OnInit {
  // 表格实列
  @ViewChild('tableComponent') tableComponent: TableComponent;
  // 智慧杆状态
  @ViewChild('pointStatusTemp') pointStatusTemp: TemplateRef<HTMLDocument>;
  // 滑块配置
  public sliderConfig: Array<SliderCommon> = [];
  // 规划列表数据
  public planWisdomList: WisdomPointInfoModel[] = [];
  // 列表配置
  public tableConfig: TableConfigModel = new TableConfigModel();
  // 分页参数
  public pageBean: PageModel = new PageModel();
  // 规划和项目语言包
  public language: PlanProjectLanguageInterface;
  // 公共国际化语言包
  public commonLanguage: CommonLanguageInterface;
  // 查询参数对象集
  public queryCondition: QueryConditionModel = new QueryConditionModel();
  public pointStatusEnum = PointStatusEnum;

  constructor(public $nzI18n: NzI18nService,
              private $message: FiLinkModalService,
              private $router: Router,
              private $planApiService: PlanApiService) {
  }

  ngOnInit() {
    this.commonLanguage = this.$nzI18n.getLocaleData(LanguageEnum.common);
    this.language = this.$nzI18n.getLocaleData(LanguageEnum.planProject);
    this.initTableConfig();
    this.refreshPlanWisdomList();
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
        iconClass: 'fiLink-processed to-be-built',
        textClass: 'to-be-built',
        code: PointStatusEnum.toBeBuilt, sum: 0
      },
      // 在建
      {
        label: this.language.underConstruction,
        iconClass: 'fiLink-processing under-construction',
        textClass: 'under-construction',
        code: PointStatusEnum.underConstruction, sum: 0
      },
      //   已建
      {
        label: this.language.hasBeenBuilt,
        iconClass: 'fiLink-filink-yiwancheng-icon has-been-built',
        textClass: 'has-been-built',
        code: PointStatusEnum.hasBeenBuilt, sum: 0
      },
    ];
    this.querySliderCount();
  }

  /**
   * 分页回调
   * param event
   */
  public pageChange(event: PageModel): void {
    this.queryCondition.pageCondition.pageSize = event.pageSize;
    this.queryCondition.pageCondition.pageNum = event.pageIndex;
    this.refreshPlanWisdomList();
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
  public slideShowChange(event: SliderConfigModel): void {
    if (event) {
      this.tableConfig.outHeight = SHOW_SLIDER_HIGH_CONST;
    } else {
      this.tableConfig.outHeight = HIDDEN_SLIDER_HIGH_CONST;
    }
    this.tableComponent.calcTableHeight();
  }

  /**
   * 刷新规划列表
   */
  private refreshPlanWisdomList(): void {
    this.tableConfig.isLoading = true;
    this.$planApiService.selectPlanPointList(this.queryCondition).subscribe((result: ResultModel<WisdomPointInfoModel[]>) => {
      this.tableConfig.isLoading = false;
      this.planWisdomList = result.data || [];
      this.pageBean.pageIndex = result.pageNum;
      this.pageBean.Total = result.totalCount;
      this.pageBean.pageSize = result.size;
      this.planWisdomList.forEach(item => {
        item.statusIconClass = PointStatusIconEnum[item.pointStatus];
      });
    });
  }

  /**
   * 删除点位
   * param ids
   */
  private deletePlanPoint(ids: string[]): void {
    this.tableConfig.isLoading = true;
    this.$planApiService.deletePlanPoint(ids).subscribe((result: ResultModel<string>) => {
      if (result.code === ResultCodeEnum.success) {
        this.$message.success(this.language.deletePlanWisdomSuccess);
        // 删除跳第一页
        this.queryCondition.pageCondition.pageNum = 1;
        this.refreshPlanWisdomList();
      } else {
        this.tableConfig.isLoading = false;
        this.$message.error(result.msg);
      }
    }, () => {
      this.tableConfig.isLoading = false;
    });
  }

  /**
   * 初始化列表参数
   */
  private initTableConfig(): void {
    this.tableConfig = {
      isDraggable: true,
      isLoading: true,
      primaryKey: 'planWisdomList',
      outHeight: 108,
      showSizeChanger: true,
      showSearchSwitch: true,
      showPagination: true,
      scroll: {x: '1804px', y: '340px'},
      noIndex: true,
      showSearchExport: true,
      columnConfig: [
        { // 选择
          type: 'select',
          fixedStyle: {fixedLeft: true, style: {left: '0px'}},
          width: 62
        },
        { // 序号
          type: 'serial-number',
          width: 62,
          title: this.commonLanguage.serialNumber,
          fixedStyle: {fixedLeft: true, style: {left: '62px'}}
        },
        { // 智慧杆名称
          title: this.language.wisdomName, key: 'pointName', width: 150,
          isShowSort: true,
          searchable: true,
          configurable: true,
          searchConfig: {type: 'input'}
        },
        { // 智慧杆型号
          title: this.language.wisdomModel, key: 'pointModel', width: 150,
          isShowSort: true,
          searchable: true,
          configurable: true,
          searchConfig: {type: 'input'}
        },
        { // 智慧杆状态
          title: this.language.status, key: 'pointStatus', width: 150,
          type: 'render',
          renderTemplate: this.pointStatusTemp,
          isShowSort: true,
          searchable: true,
          configurable: true,
          searchConfig: {
            type: 'select', selectType: 'multiple',
            selectInfo: CommonUtil.codeTranslate(PointStatusEnum, this.$nzI18n, null, LanguageEnum.planProject) as SelectModel[],
            label: 'label',
            value: 'code'
          }
        },
        { // 所属规划
          title: this.language.planId, key: 'planName', width: 150,
          isShowSort: true,
          searchable: true,
          configurable: true,
          searchConfig: {type: 'input'}
        },
        { // 所属区域
          title: this.language.BelongsAreaName, key: 'areaName', width: 150,
          isShowSort: true,
          searchable: true,
          configurable: true,
          searchConfig: {type: 'input'}
        },
        { // 操作列
          title: this.commonLanguage.operate,
          searchable: true,
          searchConfig: {type: 'operate'},
          key: '', width: 180,
          fixedStyle: {fixedRight: true, style: {right: '0px'}}
        },
      ],
      topButtons: [
        { // 批量删除
          text: this.commonLanguage.deleteBtn,
          btnType: 'danger',
          className: 'table-top-delete-btn',
          iconClassName: 'fiLink-delete',
          permissionCode: '18-1-2-2',
          canDisabled: true,
          needConfirm: true,
          handle: (data: WisdomPointInfoModel[]) => {
            const ids = data.map(item => item.pointId);
            this.deletePlanPoint(ids);
          }
        },
      ],
      operation: [
        {
          text: this.commonLanguage.location, className: 'fiLink-location',
          permissionCode: '18-1-2-3',
          handle: (currentIndex: FacilityListModel) => {
            this.$router.navigate(['business/index'],
              {
                queryParams: {
                  deviceId: currentIndex.deviceId,
                  areaCode: currentIndex.areaCode,
                  positionBase: currentIndex.positionBase,
                }
              }).then();
          }
        },
        { // 编辑
          text: this.commonLanguage.edit, className: 'fiLink-edit',
          permissionCode: '18-1-2-1',
          handle: (data: WisdomPointInfoModel) => {
            this.$router.navigate(['business/plan-project/plan-wisdom-detail/update'], {queryParams: {id: data.pointId}}).then();
          },
        },
        { // 删除
          text: this.commonLanguage.deleteBtn,
          className: 'fiLink-delete red-icon',
          permissionCode: '18-1-2-2',
          btnType: 'danger',
          iconClassName: 'fiLink-delete',
          needConfirm: true,
          canDisabled: true,
          handle: (data: WisdomPointInfoModel) => {
            this.deletePlanPoint([data.pointId]);
          }
        },
      ],
      rightTopButtons: [],
      moreButtons: [],
      handleExport: (e: ListExportModel<WisdomPointInfoModel[]>) => {
        // 获取导出的数据和文件格式
        const exportData = new ExportRequestModel(e.columnInfoList, e.excelType);
        const translationField = ['planFinishTime', 'createTime'];
        // 遍历字段设置后台需要特殊处理的标示
        exportData.columnInfoList.forEach(item => {
          if (translationField.includes(item.propertyName)) {
            item.isTranslation = IS_TRANSLATION_CONST;
          }
        });
        //  处理选中的数据
        if (e && !_.isEmpty(e.selectItem)) {
          const pointIds = e.selectItem.map(item => item.pointId);
          exportData.queryCondition.filterConditions = exportData.queryCondition.filterConditions.concat([new FilterCondition('pointId', OperatorEnum.in, pointIds)]);
        } else {
          exportData.queryCondition.filterConditions = e.queryTerm;
        }
        // 调用后台的服务接口
        this.$planApiService.exportPlanPointList(exportData).subscribe((res: ResultModel<string>) => {
          if (res.code === ResultCodeEnum.success) {
            this.$message.success(this.language.exportPlanWisdomListSuccess);
          } else {
            this.$message.error(res.msg);
          }
        });
      },
      sort: (event: SortCondition) => {
        this.queryCondition.sortCondition = event;
        this.refreshPlanWisdomList();
      },
      handleSearch: (event: FilterCondition[]) => {
        this.queryCondition.pageCondition.pageNum = 1;
        this.queryCondition.filterConditions = event;
        this.refreshPlanWisdomList();
      }
    };
  }

  /**
   * 智慧杆列表总数小卡片
   */
  private querySliderCount() {
    this.$planApiService.pointCountByStatus().subscribe((result: ResultModel<any[]>) => {
      if (result.code === ResultCodeEnum.success) {
        let sum = 0;
        this.sliderConfig.forEach(item => {
          const temp = result.data.find(_item => _item.status === item.code);
          if (temp) {
            item.sum = temp.number;
          }
          sum += item.sum;
        });
        this.sliderConfig[0].sum = sum;
      }
    });
  }
}
