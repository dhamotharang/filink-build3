import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ProjectInfoModel} from '../../share/model/project-info.model';
import {PageModel} from '../../../../shared-module/model/page.model';
import {TableConfigModel} from '../../../../shared-module/model/table-config.model';
import {FilterCondition, QueryConditionModel, SortCondition} from '../../../../shared-module/model/query-condition.model';
import {CommonLanguageInterface} from '../../../../../assets/i18n/common/common.language.interface';
import {LanguageEnum} from '../../../../shared-module/enum/language.enum';
import {NzI18nService} from 'ng-zorro-antd';
import {Router} from '@angular/router';
import {PlanProjectApiService} from '../../share/service/plan-project.service';
import {ResultCodeEnum} from '../../../../shared-module/enum/result-code.enum';
import {PlanProjectLanguageInterface} from '../../../../../assets/i18n/plan-project/plan-project.language.interface';
import {FiLinkModalService} from '../../../../shared-module/service/filink-modal/filink-modal.service';
import {ProjectStatusEnum} from '../../share/enum/project-status.enum';
import {SliderCommon} from '../../../../core-module/model/slider-common';
import {ProjectStatusIconEnum} from '../../share/enum/project-status-icon.enum';
import {CommonUtil} from '../../../../shared-module/util/common-util';
import {TableComponent} from '../../../../shared-module/component/table/table.component';
import {ListExportModel} from '../../../../core-module/model/list-export.model';
import {ExportRequestModel} from '../../../../shared-module/model/export-request.model';
import {OperatorEnum} from '../../../../shared-module/enum/operator.enum';
import * as _ from 'lodash';
import {ResultModel} from '../../../../shared-module/model/result.model';
import {HIDDEN_SLIDER_HIGH_CONST, SHOW_SLIDER_HIGH_CONST} from '../../../facility/share/const/facility-common.const';
import {PointStatusEnum} from '../../share/enum/point-status.enum';
import {OperateTypeEnum} from '../../../../shared-module/enum/page-operate-type.enum';

/**
 * 项目管理 项目列表页面
 */
@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})
export class ProjectListComponent implements OnInit {
  // 设施状态模板
  @ViewChild('projectStatusTemp') projectStatusTemp: TemplateRef<HTMLDocument>;
  // 表格实列
  @ViewChild('tableComponent') tableComponent: TableComponent;
  // 滑块配置
  public sliderConfig: Array<SliderCommon> = [];
  // 项目列表数据源
  // public dataSet: ProjectInfoModel[] = [];
  public dataSet = [];
  // 项目列表分页实体
  public pageBean: PageModel = new PageModel();
  // 项目列表配置
  public tableConfig: TableConfigModel;
  // 项目列表查询条件
  public queryCondition: QueryConditionModel = new QueryConditionModel();
  // 公共语言包国际化
  public commonLanguage: CommonLanguageInterface;
  // 项目规划语言包
  public language: PlanProjectLanguageInterface;
  // 列表勾选的项目id集合
  public selectProjectIds: string[] = [];

  // 项目状态枚举
  public projectStatusEnum = ProjectStatusEnum;
  // 国际化枚举
  public languageEnum = LanguageEnum;

  // 结束项目时项目智慧杆建设状态确认弹窗是否显示
  public isShowPointStatusWindow: boolean = false;
  public wisdomListDataSet = [];
  // 智慧杆列表分页
  public wisdomListPageBean: PageModel = new PageModel();
  // 智慧杆弹窗表格配置
  public tableWisdomListConfig: TableConfigModel;
  public selectFinishedProjectData = [];

  constructor(
    public $nzI18n: NzI18nService,
    private $router: Router,
    private $message: FiLinkModalService,
    // 项目接口
    private $planProjectApiService: PlanProjectApiService
  ) {
  }

  public ngOnInit() {
    this.language = this.$nzI18n.getLocaleData(LanguageEnum.planProject);
    this.commonLanguage = this.$nzI18n.getLocaleData(LanguageEnum.common);
    // 加载表格配置
    this.initTableConfig();
    this.refreshData();
    // 项目列表上方 滑块配置
    this.sliderConfig = [
      {
        // 项目总数
        label: this.language.projectSum,
        iconClass: 'fiLink-work-order-all wisdom-sum',
        textClass: 'wisdom-sum',
        code: null, sum: 0
      },
      {
        // 未启动
        label: this.language.notStarted,
        iconClass: ProjectStatusIconEnum.notStarted,
        textClass: 'no-start',
        code: ProjectStatusEnum.notStarted, sum: 0
      },
      {
        // 进行中
        label: this.language.working,
        iconClass: ProjectStatusIconEnum.working,
        textClass: 'project-working',
        code: ProjectStatusEnum.working, sum: 0
      },
      {
        // 延期
        label: this.language.delayed,
        iconClass: ProjectStatusIconEnum.delayed,
        textClass: 'project-delayed',
        code: ProjectStatusEnum.delayed, sum: 0
      },
      {
        // 已结束
        label: this.language.finished,
        iconClass: ProjectStatusIconEnum.finished,
        textClass: 'project-finished',
        code: ProjectStatusEnum.finished, sum: 0
      }
    ];
    // 统计各状态项目数
    this.queryProjectInfoStatistics();
  }

  /**
   * 分页查询
   * @param event PageModel
   */
  public pageChange(event: PageModel): void {
    this.queryCondition.pageCondition.pageNum = event.pageIndex;
    this.queryCondition.pageCondition.pageSize = event.pageSize;
    this.refreshData();
  }

  /**
   * 选中滑块卡片
   */
  public sliderChange(event) {
    if (event.code) {
      // 先清空表格里面的查询条件
      this.tableComponent.searchDate = {};
      this.tableComponent.rangDateValue = {};
      this.tableComponent.tableService.resetFilterConditions(this.tableComponent.queryTerm);
      this.tableComponent.handleSetControlData('status', [event.code]);
      this.tableComponent.handleSearch();
    } else {
      this.tableComponent.handleRest();
    }
  }

  /**
   * 滑块变化
   * param event
   */
  public slideShowChange(event) {
    if (event) {
      this.tableConfig.outHeight = SHOW_SLIDER_HIGH_CONST;
    } else {
      this.tableConfig.outHeight = HIDDEN_SLIDER_HIGH_CONST;
    }
    this.tableComponent.calcTableHeight();
  }

  /**
   * 智慧杆列表翻页
   * @param event 翻页数据
   */
  public wisdomListPageChange(event) {

  }

  /**
   * 确认项目智慧杆状态
   */
  public handleOk() {
    this.finishProject();
  }

  /**
   * 取消
   */
  public handleCancel() {
    this.isShowPointStatusWindow = false;
  }

  /**
   * 项目列表统计卡片
   */
  private queryProjectInfoStatistics(): void {
    this.$planProjectApiService.queryProjectInfoStatistics().subscribe((result) => {
      if (result.code === ResultCodeEnum.success) {
        this.sliderConfig.forEach(item => {
          const temp = result.data.find(_item => _item.status === item.code);
          if (temp) {
            item.sum = temp.number;
          }
        });
        this.sliderConfig[0].sum = _.sumBy(result.data, 'number') || 0;
      }
    });
  }

  /**
   * 项目列表初始化
   */
  private initTableConfig() {
    this.tableConfig = {
      isDraggable: true,
      isLoading: true,
      outHeight: 108,
      primaryKey: 'projectManageList',
      keepSelected: true,
      selectedIdKey: 'projectId',
      showSearchSwitch: true,
      scroll: {x: '1804px', y: '340px'},
      noIndex: true,
      showSearchExport: true,
      columnConfig: [
        { // 选择
          title: this.commonLanguage.select,
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
        { // 项目名称
          title: this.language.projectName,
          key: 'projectName',
          width: 150,
          isShowSort: true,
          configurable: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // 项目编号
          title: this.language.projectCode,
          key: 'projectCode',
          width: 150,
          isShowSort: true,
          configurable: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // 项目规模
          title: this.language.projectScale,
          key: 'projectScale',
          width: 150,
          isShowSort: true,
          configurable: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // 已建数量
          title: this.language.builtCount,
          key: 'builtCount',
          width: 150,
          isShowSort: true,
          searchable: true,
          configurable: true,
          searchConfig: {type: 'input'}
        },
        { // 在建数量
          title: this.language.buildingCount,
          key: 'buildingCount',
          width: 150,
          isShowSort: true,
          searchable: true,
          configurable: true,
          searchConfig: {type: 'input'}
        },
        { // 项目状态
          title: this.language.projectStatus,
          key: 'status',
          type: 'render',
          renderTemplate: this.projectStatusTemp,
          width: 150,
          isShowSort: true,
          searchable: true,
          configurable: true,
          searchConfig: {
            type: 'select',
            selectType: 'multiple',
            selectInfo: CommonUtil.codeTranslate(ProjectStatusEnum, this.$nzI18n, null, LanguageEnum.planProject),
            label: 'label',
            value: 'code'
          }
        },
        { // 建设部门
          title: this.language.builtDept,
          key: 'builtDept',
          width: 150,
          isShowSort: true,
          configurable: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // 项目经理
          title: this.language.manager,
          key: 'manager',
          width: 150,
          isShowSort: true,
          configurable: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // 设计单位
          title: this.language.designUnit,
          key: 'designUnit',
          width: 150,
          isShowSort: true,
          configurable: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // 建设单位
          title: this.language.buildUnit,
          key: 'buildUnit',
          width: 150,
          isShowSort: true,
          configurable: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // 监理单位
          title: this.language.supervisionUnit,
          key: 'supervisionUnit',
          width: 150,
          isShowSort: true,
          configurable: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // 备注
          title: this.language.remark,
          key: 'remark',
          width: 150,
          isShowSort: true,
          configurable: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // 操作列
          title: this.commonLanguage.operate,
          searchable: true,
          searchConfig: {type: 'operate'},
          key: '', width: 180,
          fixedStyle: {fixedRight: true, style: {right: '0px'}}
        }
      ],
      showPagination: true,
      bordered: false,
      showSearch: false,
      topButtons: [
        { // 创建
          text: '新增',
          iconClassName: 'fiLink-add-no-circle',
          handle: () => {
            this.$router.navigate(['business/plan-project/project-detail/add']).then();
          }
        },
        { // 删除
          text: this.commonLanguage.deleteBtn,
          btnType: 'danger',
          className: 'table-top-delete-btn',
          iconClassName: 'fiLink-delete',
          canDisabled: true,
          handle: () => {
            this.deleteProjectInfo(this.selectProjectIds);
          }
        },
        { // 启动项目
          text: this.language.startProject,
          btnType: 'danger',
          canDisabled: true,
          needConfirm: true,
          // confirmTitle: '是否启动项目?',
          confirmContent: '是否启动项目?',
          handle: (event) => {
            // 只能启动未启动的项目
            let canOperate = true;
            event.forEach(item => {
              if (item.status !== ProjectStatusEnum.notStarted) {
                canOperate = false;
                return;
              }
            });
            if (canOperate) {
              this.startProject(this.selectProjectIds);
            } else {
              this.$message.info(this.language.onlyStartNoStartSProject);
            }

          }
        },
        { // 结束项目
          text: this.language.endProject,
          btnType: 'danger',
          canDisabled: true,
          handle: (event) => {
            let canOperate = true;
            // 检查选中项目的状态
            event.forEach(item => {
                if (item.status === ProjectStatusEnum.notStarted || item.status === ProjectStatusEnum.finished) {
                  canOperate = false;
                  return;
                }
              }
            );
            if (canOperate) {
              this.showWisdomList(this.selectProjectIds);
            } else {
              this.$message.info(this.language.onlyEndWorkingProject);
            }
          }
        }
      ],
      operation: [
        { // 定位
          text: '定位',
          className: 'fiLink-location',
          handle: () => {
          }
        },
        { // 编辑项目
          text: this.commonLanguage.edit,
          className: 'fiLink-edit',
          handle: (event: ProjectInfoModel) => {
            if (event.status === ProjectStatusEnum.finished) {
              this.$message.info(this.language.cannotModify);
              return;
            }
            this.$router.navigate(['business/plan-project/project-detail/update'],
              {queryParams: {id: event.projectId}}).then();
          }
        },
        { // 编辑项目点位
          text: this.commonLanguage.edit,
          className: 'fiLink-coordinate-edit-icon',
          handle: (event: ProjectInfoModel) => {
            this.$router.navigate(['business/plan-project/point-detail'],
              {queryParams: {
                type: OperateTypeEnum.update,
                id: event.projectId}}).then();
          }
        },
        { // 启动项目
          text: this.language.startProject,
          className: 'fiLink-flink_qidong-icon',
          needConfirm: true,
          // confirmTitle: '是否启动项目?',
          confirmContent: '是否启动项目?',
          handle: (event: ProjectInfoModel) => {
            if (event.status !== ProjectStatusEnum.notStarted) {
              this.$message.info(this.language.onlyStartNoStartSProject);
              return;
            }
            this.startProject([event.projectId]);
          }
        },
        { // 结束项目
          text: this.language.endProject,
          className: 'fiLink-flink_jiesu-icon',
          iconClassName: 'fiLink-flink_jiesu-icon',
          handle: (event: ProjectInfoModel) => {
            if (event.status === ProjectStatusEnum.notStarted || event.status === ProjectStatusEnum.finished) {
              this.$message.info(this.language.onlyEndWorkingProject);
              return;
            }
            this.showWisdomList([event.projectId]);
            this.selectFinishedProjectData.push({projectId: event.projectId});
          }
        },
        { // 删除
          text: this.commonLanguage.deleteBtn,
          className: 'fiLink-delete red-icon',
          iconClassName: 'fiLink-delete',
          btnType: 'danger',
          handle: (event: ProjectInfoModel) => {
            this.deleteProjectInfo([event.projectId]);
          }
        }
      ],
      // 勾选
      handleSelect: (event: ProjectInfoModel[]) => {
        if (!event.length) {
          this.selectProjectIds = [];
          return;
        }
        event.forEach(item => {
          this.selectProjectIds.push(item.projectId);
        });
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
      handleExport: (event: ListExportModel<ProjectInfoModel[]>) => {
        // 获取导出的数据和文件格式
        const exportData = new ExportRequestModel(event.columnInfoList, event.excelType);
        //  处理选中的数据
        if (event && !_.isEmpty(event.selectItem)) {
          const projectIds = event.selectItem.map(item => item.projectId);
          exportData.queryCondition.filterConditions = exportData.queryCondition.filterConditions.concat([new FilterCondition('projectId', OperatorEnum.in, projectIds)]);
        } else {
          exportData.queryCondition.filterConditions = event.queryTerm;
        }
        // 导出接口
        this.$planProjectApiService.exportProjectList(exportData).subscribe((res: ResultModel<string>) => {
          if (res.code === ResultCodeEnum.success) {
            this.$message.success(res.msg);
          } else {
            this.$message.error(res.msg);
          }
        });
      }
    };
  }

  private initWisdomTable() {
    this.tableWisdomListConfig = {
      isDraggable: true,
      isLoading: true,
      outHeight: 108,
      notShowPrint: true,
      showSizeChanger: false,
      showSearchSwitch: false,
      showPagination: true,
      scroll: {x: '1804px', y: '340px'},
      selectedIdKey: 'projectId',
      noIndex: true,
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
          // searchable: true,
          // searchConfig: {type: 'input'}
        },
        { // 所属项目
          title: '所属项目', key: 'projectName', width: 150,
          isShowSort: true,
          // searchable: true,
          // searchConfig: {type: 'input'}
        },
        { // 所属规划
          title: this.language.planId, key: 'planId', width: 150,
          isShowSort: true,
          // searchable: true,
          // searchConfig: {type: 'input'}
        },
      ],
      handleSelect: (current) => {
        this.selectFinishedProjectData = current;
      }
    };
  }

  /**
   * 刷新项目列表
   */
  private refreshData(): void {
    this.tableConfig.isLoading = true;
    this.$planProjectApiService.queryProjectInfoListByPage(this.queryCondition).subscribe((res: ResultModel<any>) => {
      this.tableConfig.isLoading = false;
      if (res.code === ResultCodeEnum.success) {
        this.dataSet = res.data || [];
        this.dataSet.forEach(item => {
          item.statusIconClass = ProjectStatusIconEnum[item.status];
        });
        this.pageBean.pageIndex = res.pageNum;
        this.pageBean.Total = res.totalCount;
        this.pageBean.pageSize = res.size;
      }
    });
  }

  /**
   * 启动项目
   * @param data 选中的项目
   */
  private startProject(data: string[]): void {
    this.$planProjectApiService.startProject(data).subscribe((result) => {
      if (result.code === ResultCodeEnum.success) {
        console.log(result.data);
        this.$message.success(result.msg);
        this.refreshData();
      } else {
        this.$message.error(result.msg);
      }
    });
  }

  /**
   * 打开确认在建智慧杆状态弹窗
   * @param data 所选项目
   */
  private showWisdomList(data: string[]) {
    this.isShowPointStatusWindow = true;
    this.initWisdomTable();
    this.queryBuildingPointByPage(data);
  }

  /**
   * 结束项目
   */
  private finishProject(): void {
    const projectIds = [];
    const pointIds = [];
    this.selectFinishedProjectData.forEach(item => {
      if (item.projectId) {
        projectIds.push(item.projectId);
      }
      if (item.pointId) {
        pointIds.push(item.pointId);
      }
    });
    this.$planProjectApiService.finishProject(
      {
        projectIds: projectIds,
        pointIds: pointIds
      }).subscribe((result) => {
      if (result.code === ResultCodeEnum.success) {
        this.isShowPointStatusWindow = false;
        this.$message.success(result.msg);
        this.refreshData();
      } else {
        this.$message.error(result.msg);
      }
    });
  }

  /**
   * 查询项目下在建状态的点位列表(分页带权限)
   */
  private queryBuildingPointByPage(data) {
    this.tableWisdomListConfig.isLoading = true;
    const queryCondition = new QueryConditionModel();
    queryCondition.filterConditions.push(new FilterCondition('projectId', OperatorEnum.in, data));
    queryCondition.filterConditions.push(new FilterCondition('pointStatus', OperatorEnum.eq, PointStatusEnum.underConstruction));
    this.$planProjectApiService.queryBuildingPointByPage(queryCondition).subscribe((result) => {
      this.tableWisdomListConfig.isLoading = false;
      if (result.code === ResultCodeEnum.success) {
        this.wisdomListDataSet = result.data || [];
        this.wisdomListPageBean.pageIndex = result.pageNum;
        this.wisdomListPageBean.Total = result.totalCount;
        this.wisdomListPageBean.pageSize = result.size;
      } else {
        this.$message.error(result.msg);
      }
    });
  }

  /**
   * 删除项目
   * @param data 选中的项目
   */
  private deleteProjectInfo(data: string[]): void {
    this.$planProjectApiService.deleteProjectInfo(data).subscribe((result) => {
      if (result.code === ResultCodeEnum.success) {
        this.$message.success(result.msg);
        this.refreshData();
      } else {
        this.$message.error(result.msg);
      }
    });
  }
}
