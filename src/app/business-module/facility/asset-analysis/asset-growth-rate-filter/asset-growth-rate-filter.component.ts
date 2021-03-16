import {Component, EventEmitter, OnInit, OnChanges, SimpleChanges, Input, Output, TemplateRef, ViewChild} from '@angular/core';
import {FacilityLanguageInterface} from '../../../../../assets/i18n/facility/facility.language.interface';
import {FormItem} from '../../../../shared-module/component/form/form-config';
import {NzI18nService} from 'ng-zorro-antd';
import {LanguageEnum} from '../../../../shared-module/enum/language.enum';
import {CommonUtil} from '../../../../shared-module/util/common-util';
import {AssetAnalysisStatisticalDimensionEnum} from '../../share/enum/asset-analysis-statistical-dimension.enum';
import {DeviceSortEnum} from '../../../../core-module/enum/facility/facility.enum';
import {AssetAnalysisGrowthRateEnum} from '../../share/enum/asset-analysis-growth-rate.enum';
import {TreeSelectorConfigModel} from '../../../../shared-module/model/tree-selector-config.model';
import {AreaModel} from '../../../../core-module/model/facility/area.model';
import {FormOperate} from '../../../../shared-module/component/form/form-operate.service';
import {
  FilterCondition,
  QueryConditionModel,
  SortCondition
} from '../../../../shared-module/model/query-condition.model';
import {ResultModel} from '../../../../shared-module/model/result.model';
import {ResultCodeEnum} from '../../../../shared-module/enum/result-code.enum';
import {FacilityForCommonService} from '../../../../core-module/api-service/facility';
import {FiLinkModalService} from '../../../../shared-module/service/filink-modal/filink-modal.service';
import {FacilityForCommonUtil} from '../../../../core-module/business-util/facility/facility-for-common.util';
import {TimerSelectorService} from '../../../../shared-module/service/time-selector/timer-selector.service';
import {TableComponent} from '../../../../shared-module/component/table/table.component';
import {TableConfigModel} from '../../../../shared-module/model/table-config.model';
import {PageModel} from '../../../../shared-module/model/page.model';
import {CommonLanguageInterface} from '../../../../../assets/i18n/common/common.language.interface';
import {PlanProjectLanguageInterface} from '../../../../../assets/i18n/plan-project/plan-project.language.interface';
import {ProjectStatusEnum} from '../../../plan-project/share/enum/project-status.enum';
import {ProjectStatusIconEnum} from '../../../plan-project/share/enum/project-status-icon.enum';
import {AssetAnalysisApiService} from '../../share/service/asset-analysis/asset-analysis-api.service';
import * as _ from 'lodash';
import {ProjectInfoModel} from '../../../plan-project/share/model/project-info.model';
import {AssetAnalysisAssetDimensionEnum} from '../../share/enum/asset-analysis-asset-dimension.enum';
import {differenceInCalendarDays} from 'date-fns';

/**
 * 资产分析-资产增长率组件
 */
@Component({
  selector: 'app-asset-growth-rate-filter',
  templateUrl: './asset-growth-rate-filter.component.html',
  styleUrls: ['./asset-growth-rate-filter.component.scss']
})
export class AssetGrowthRateFilterComponent implements OnInit, OnChanges {
  // 当前选中tab页
  @Input() public selectedIndex = 0;
  // 向父组件传查询条件
  @Output() public assetGrowthRateFilterConditionEmit = new EventEmitter<any>();
  // 资产类别选择模板
  @ViewChild('selectAssetType') public selectAssetType: TemplateRef<HTMLDocument>;
  // 区域选择器模版
  @ViewChild('AreaSelectRef') public AreaSelectRef: TemplateRef<HTMLDocument>;
  // 项目弹窗模版
  @ViewChild('ProjectSelectRef') public ProjectSelectRef: TemplateRef<HTMLDocument>;
  // 项目列表
  @ViewChild('projectListTable') public projectListTable: TableComponent;
  // 项目列表设施状态模板
  @ViewChild('projectStatusTemp') projectStatusTemp: TemplateRef<HTMLDocument>;
  // 月增长率时间选择器模版
  @ViewChild('SelectTime') public SelectTime: TemplateRef<HTMLDocument>;
  // 年增长率时间选择器模版
  @ViewChild('yearSelectTime') public yearSelectTime: TemplateRef<HTMLDocument>;
  // 设施语言包
  public language: FacilityLanguageInterface;
  // 公共语言包国际化
  public commonLanguage: CommonLanguageInterface;
  // 项目列表语言包
  public projectLanguage: PlanProjectLanguageInterface;
  // 项目状态枚举
  public projectStatusEnum = ProjectStatusEnum;
  // 国际化枚举
  public languageEnum = LanguageEnum;
  // 资产类别多选下拉框数据
  public assetTypeData: any[] = [];
  // 资产类多选下拉框选中数据
  public assetTypeSelectData: any[] = [];
  // 资产类别多选下拉框数据code码集合
  public assetTypeCodeList: any[] = [];
  // form表单配置
  public formColumn: FormItem[] = [];
  // 区域树配置
  public treeSelectorConfig: TreeSelectorConfigModel;
  // 区域树数据
  public treeNodes: AreaModel[];
  // 区域名称
  public areaName: string = '';
  // 区域选择器显示控制
  public isVisible: boolean = false;
  // 区域id集合
  public selectAreaIds: string[] = [];
  // 选择项目弹窗显示
  public isShow: boolean = false;
  // 勾选项目id集合
  public selectProjectIds: string[] = [];
  // 勾选项目名称
  public projectName: string = '';
  // 项目列表配置
  public tableConfig: TableConfigModel;
  // 项目列表分页
  public pageBean: PageModel = new PageModel();
  // 项目列表查询条件
  public projectQueryCondition = new QueryConditionModel();
  // 项目列表数据
  public dataSet: any[] = [];
  // 资产占比表单实例
  public formStatus: FormOperate;
  // 分析按钮是否可以点击
  public isClick: boolean = false;
  // 创建筛选实例
  public queryConditions = new QueryConditionModel();
  // 选中的筛选条件
  public filterCondition: any;
  // 时间选择器默认条件
  public date: Date[] = [];
  // 判断是否第一次选中tab页
  public isFirstClick: boolean = true;
  // 表单筛选默认条件
  private formDefaultValue = {
    // 资产维度默认值设施
    assetDimension: AssetAnalysisAssetDimensionEnum.facility,
    // 资产类别默认值智慧杆
    assetType: [],
    // 统计维度默认值区域
    statisticalDimension: AssetAnalysisStatisticalDimensionEnum.area,
    // 选择区域或选择项目默认值为空
    selectAreaOrProject: [],
    // 增长率默认值月增长
    growthRate: AssetAnalysisGrowthRateEnum.monthlyGrowth,
  };
  // 获取全部区域数据
  private allAreaIdList = [];
  // 全部区域名拼接字符串
  private allAreaName: string;

  constructor(
    public $nzI18n: NzI18nService,
    // 设施功能服务
    public $facilityCommonService: FacilityForCommonService,
    public $assetAnalysisApiService: AssetAnalysisApiService,
    private $message: FiLinkModalService,
    private $timerSelectorService: TimerSelectorService
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    // 判断是否为当前点击的tab页和是否为第一次点击，防止接口默认调用
    if (changes.selectedIndex.currentValue === 1 && this.isFirstClick) {
      this.isFirstClick = false;
      this.assetTypeData = FacilityForCommonUtil.getRoleFacility(this.$nzI18n);
      this.assetTypeCodeList = this.assetTypeData.map(item => {
        return item.code;
      });
      if (this.assetTypeCodeList.includes(DeviceSortEnum.pole)) {
        this.assetTypeSelectData = [DeviceSortEnum.pole];
      }
      this.getAreaTreeData().then(() => {
        this.initColumn();
      }, () => {
        this.initColumn();
      }).catch(() => {
        this.initColumn();
      });
    }
  }

  ngOnInit() {
    // 国际化
    this.language = this.$nzI18n.getLocaleData(LanguageEnum.facility);
    this.commonLanguage = this.$nzI18n.getLocaleData(LanguageEnum.common);
    this.projectLanguage = this.$nzI18n.getLocaleData(LanguageEnum.planProject);
    this.initTreeSelectorConfig();
    this.initTableConfig();
  }

  /**
   * 获取区域数数据源
   */
  public getAreaTreeData(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.$facilityCommonService.queryAreaList().subscribe((result: ResultModel<AreaModel[]>) => {
        if (result.code === ResultCodeEnum.success) {
          const arr = [];
          const list = [];
          result.data.forEach(item => {
            arr.push(item.areaName);
            list.push(item.areaId);
          });
          this.allAreaIdList = list;
          this.allAreaName = arr.toString();
          this.selectAreaIds = list;
          this.areaName = arr.toString();
          this.treeNodes = result.data || [];
          // 递归设置区域的选择情况
          this.setAreaSelectAll(this.treeNodes);
          this.addName(this.treeNodes);
          this.treeSelectorConfig.treeNodes = this.treeNodes;
          resolve();
        } else {
          this.$message.error(result.msg);
          reject();
        }
      }, () => {
        reject();
      });
    });

  }

  /**
   * 表单实例对象
   * param event
   */
  public formInstance(event: { instance: FormOperate }): void {
    if (!this.formColumn.length) {
      return;
    }
    this.formStatus = event.instance;
    this.formStatus.group.statusChanges.subscribe(() => {
      this.isClick = !this.formStatus.getValid();
    });
    this.formStatus.resetData(this.formDefaultValue);
    this.formStatus.resetControlData('assetType', this.assetTypeSelectData);
    this.formStatus.resetControlData('selectAreaOrProject', this.allAreaIdList);
    this.formStatus.resetControlData('selectTime', this.date);
    if (!this.isClick) {
      this.assetGrowthRateAnalysis();
    }
  }

  /**
   * 资产增长率分析
   */
  public assetGrowthRateAnalysis(): void {
    let str: string = '';
    const data = this.formStatus.getData();
    if (data.growthRate === AssetAnalysisGrowthRateEnum.monthlyGrowth) {
      str = '%Y-%m';
    } else {
      str = '%Y';
    }
    this.queryConditions.filterConditions = [{
      filterField: data.assetDimension,
      operator: 'in',
      filterValue: data.assetType
    },
      {
        filterField: data.statisticalDimension,
        operator: 'in',
        filterValue: data.selectAreaOrProject
      },
      {
        filterField: 'createTime',
        operator: 'gte',
        filterValue: data.selectTime[0].getTime()
      },
      {
        filterField: 'createTime',
        operator: 'lte',
        filterValue: data.selectTime[1].getTime()
      },
      {
        filterField: 'growthRateDimension',
        operator: 'eq',
        filterValue: str
      }];
    this.filterCondition = {
      assetType: data.assetDimension,
      GrowthEmitCondition: this.queryConditions,
      selectAssetType: data.assetType,
      selectGrowthRateType: data.growthRate
    };
    this.assetGrowthRateFilterConditionEmit.emit(this.filterCondition);
  }

  /**
   * 显示区域选择弹窗
   */
  public showAreaSelect(): void {
    this.isVisible = true;
  }

  /**
   * 显示项目列表选择弹窗
   */
  public showProjectSelect(): void {
    this.isShow = true;
  }

  /**
   * 点击取消关闭选择项目列表弹窗
   */
  public handleCancel(): void {
    this.isShow = false;
  }

  /**
   * 区域选择器选择结果
   */
  public selectDataChange(event) {
    this.selectAreaIds = [];
    const arr = [];
    if (event.length > 0) {
      event.forEach(item => {
        this.selectAreaIds.push(item.areaId);
        arr.push(item.areaName);
      });
      this.formStatus.resetControlData('selectAreaOrProject', this.selectAreaIds);
    } else {
      this.selectAreaIds = arr;
      this.formStatus.resetControlData('selectAreaOrProject', null);
    }
    FacilityForCommonUtil.setAreaNodesMultiStatus(this.treeNodes, this.selectAreaIds);
    this.areaName = arr.toString();
  }

  /**
   * 资产类别多选下拉框勾选改变
   */
  public onChangeAssetType(event): void {
    this.assetTypeSelectData = event;
    if (event.length) {
      this.formStatus.resetControlData('assetType', event);
    } else {
      this.formStatus.resetControlData('assetType', null);
    }
  }

  /**
   * 时间选择器数据改变
   */
  public onChange(event): void {
    if (event && this.date[0] && this.date[1] && this.date[0].getTime() < this.date[1].getTime()) {
      this.formStatus.resetControlData('selectTime', this.date);
    } else {
      this.formStatus.resetControlData('selectTime', []);
    }
  }

  /**
   * 筛选条件重置为默认条件
   */
  public reset(): void {
    this.formStatus.resetData(this.formDefaultValue);
    if (this.assetTypeCodeList.includes(DeviceSortEnum.pole)) {
      this.assetTypeSelectData = [DeviceSortEnum.pole];
      this.formStatus.resetControlData('assetType', this.assetTypeSelectData);
    }
    this.selectAreaIds = this.allAreaIdList;
    this.areaName = this.allAreaName;
    this.setAreaSelectAll(this.treeNodes);
    const date = this.$timerSelectorService.getYearRange();
    this.date = [new Date(_.first(date)), new Date()];
    this.formStatus.resetControlData('selectAreaOrProject', this.allAreaIdList);
    this.formStatus.resetControlData('selectTime', this.date);
  }

  /**
   * 分页查询
   * @param event PageModel
   */
  public pageChange(event: PageModel): void {
    this.projectQueryCondition.pageCondition.pageNum = event.pageIndex;
    this.projectQueryCondition.pageCondition.pageSize = event.pageSize;
    this.refreshData();
  }

  /**
   * 设置区域选择器区域为全部勾选状态
   * param nodes
   */
  public setAreaSelectAll(nodes): void {
    nodes.forEach(item => {
      item.checked = true;
      if (item.children && item.children.length) {
        this.setAreaSelectAll(item.children);
      }
    });
  }

  /**
   * 禁用时间
   * param {Date} current
   * returns {boolean}
   */
  public disabledEndDate = (current: Date): boolean => {
    const nowTime = new Date();
    return differenceInCalendarDays(current, nowTime) > 0;
  }

  /**
   * 表单配置
   */
  private initColumn(): void {
    const arr = (CommonUtil.codeTranslate(AssetAnalysisGrowthRateEnum, this.$nzI18n, null, `${LanguageEnum.facility}.assetAnalysis`)) as any[];
    arr.splice(0, 1);
    this.formColumn = [
      // 资产维度
      {
        label: this.language.assetAnalysis.assetDimension,
        key: 'assetDimension',
        type: 'select',
        col: 8,
        require: true,
        disabled: false,
        rule: [{required: true}],
        initialValue: AssetAnalysisAssetDimensionEnum.facility,
        selectInfo: {
          data: CommonUtil.codeTranslate(AssetAnalysisAssetDimensionEnum, this.$nzI18n, null, `${LanguageEnum.facility}.assetAnalysis`),
          label: 'label',
          value: 'code'
        },
        modelChange: (controls, $event) => {
          const assetTypeColumn = this.formColumn.find(item => item.key === 'assetType');
          const statisticalDimensionColumn = this.formColumn.find(item => item.key === 'statisticalDimension');
          if ($event === AssetAnalysisAssetDimensionEnum.facility) {
            if (assetTypeColumn && statisticalDimensionColumn) {
              this.formStatus.resetControlData('assetType', null);
              this.assetTypeData = FacilityForCommonUtil.getRoleFacility(this.$nzI18n);
              this.assetTypeSelectData = [];
              statisticalDimensionColumn.selectInfo.data = CommonUtil.codeTranslate(AssetAnalysisStatisticalDimensionEnum, this.$nzI18n, null, `${LanguageEnum.facility}.assetAnalysis`);
            }
          } else {
            if (assetTypeColumn && statisticalDimensionColumn) {
              this.formStatus.resetControlData('assetType', null);
              this.formStatus.resetControlData('statisticalDimension', AssetAnalysisStatisticalDimensionEnum.area);
              this.assetTypeData = FacilityForCommonUtil.getRoleEquipmentType(this.$nzI18n);
              this.assetTypeSelectData = [];
              statisticalDimensionColumn.selectInfo.data.splice(1, 1);
            }
          }
        }
      },
      // 资产类型
      {
        label: this.language.assetAnalysis.assetType,
        key: 'assetType',
        type: 'custom',
        col: 8,
        require: true,
        disabled: false,
        rule: [{required: true}],
        template: this.selectAssetType,
      },
      // 统计维度
      {
        label: this.language.assetAnalysis.statisticalDimension,
        key: 'statisticalDimension',
        type: 'select',
        col: 8,
        require: true,
        disabled: false,
        rule: [{required: true}],
        initialValue: AssetAnalysisStatisticalDimensionEnum.area,
        selectInfo: {
          data: CommonUtil.codeTranslate(AssetAnalysisStatisticalDimensionEnum, this.$nzI18n, null, `${LanguageEnum.facility}.assetAnalysis`),
          label: 'label',
          value: 'code'
        },
        modelChange: (controls, $event) => {
          const selectAreaOrProjectColumn = this.formColumn.find(item => item.key === 'selectAreaOrProject');
          if (selectAreaOrProjectColumn) {
            if ($event === AssetAnalysisStatisticalDimensionEnum.area) {
              selectAreaOrProjectColumn.label = this.language.assetAnalysis.selectArea;
              selectAreaOrProjectColumn.template = this.AreaSelectRef;
              this.formStatus.resetControlData('selectAreaOrProject', this.selectAreaIds);
            } else {
              this.refreshData();
              selectAreaOrProjectColumn.label = this.language.assetAnalysis.selectProject;
              selectAreaOrProjectColumn.template = this.ProjectSelectRef;
              this.formStatus.resetControlData('selectAreaOrProject', this.selectProjectIds);
            }
          }

        }

      },
      // 选择区域
      {
        label: this.language.assetAnalysis.selectArea,
        key: 'selectAreaOrProject',
        type: 'custom',
        col: 8,
        require: true,
        disabled: false,
        rule: [{required: true}],
        template: this.AreaSelectRef,
      },
      // 增长率
      {
        label: this.language.assetAnalysis.growthRate,
        key: 'growthRate',
        type: 'select',
        col: 8,
        require: true,
        disabled: false,
        rule: [{required: true}],
        initialValue: AssetAnalysisGrowthRateEnum.monthlyGrowth,
        selectInfo: {
          data: arr,
          label: 'label',
          value: 'code'
        },
        modelChange: (controls, $event) => {
          const selectTimeColumn = this.formColumn.find(item => item.key === 'selectTime');
          if (selectTimeColumn) {
            if ($event === AssetAnalysisGrowthRateEnum.monthlyGrowth) {
              selectTimeColumn.template = this.SelectTime;
              const dates = this.$timerSelectorService.getYearRange();
              this.date = [new Date(_.first(dates)), new Date()];
              this.formStatus.resetControlData('selectTime', this.date);
            } else {
              selectTimeColumn.template = this.yearSelectTime;
              this.date = [];
            }
          }
        }

      },
      // 选择时间
      {
        label: this.language.assetAnalysis.selectTime,
        key: 'selectTime',
        type: 'custom',
        col: 8,
        require: true,
        disabled: false,
        rule: [{required: true}],
        template: this.SelectTime,
      }
    ];
    const date = this.$timerSelectorService.getYearRange();
    this.date = [new Date(_.first(date)), new Date()];
  }

  /**
   * 初始化单位选择器配置
   */
  private initTreeSelectorConfig(): void {
    const treeSetting = {
      check: {
        enable: true,
        chkStyle: 'checkbox',
        chkboxType: {'Y': '', 'N': ''},
      },
      data: {
        simpleData: {
          enable: false,
          idKey: 'areaId',
        },
        key: {
          name: 'areaName',
          children: 'children'
        },
      },
      view: {
        showIcon: false,
        showLine: false
      }
    };
    this.treeSelectorConfig = {
      title: this.language.selectArea,
      width: '1000px',
      height: '300px',
      treeNodes: this.treeNodes,
      treeSetting: treeSetting,
      onlyLeaves: false,
      selectedColumn: [
        {
          title: this.language.assetAnalysis.areaName, key: 'areaName', width: 100,
        },
        {
          title: this.language.assetAnalysis.areaLevel, key: 'areaLevel', width: 100,
        }
      ]
    };
  }

  /**
   * 添加区域树数据
   */
  private addName(data: AreaModel[]): void {
    data.forEach(item => {
      item.id = item.areaId;
      item.value = item.areaId;
      item.areaLevel = item.level;
      if (item.children && item.children) {
        this.addName(item.children);
      }
    });
  }

  /**
   * 刷新项目列表
   */
  private refreshData(): void {
    this.tableConfig.isLoading = true;
    this.$assetAnalysisApiService.queryProjectInfoListByPage(this.projectQueryCondition).subscribe((res) => {
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
   * 项目列表初始化
   */
  private initTableConfig() {
    if (!_.isEmpty(this.selectProjectIds)) {
      this.projectListTable.checkAll(false);
    }
    this.tableConfig = {
      isDraggable: true,
      isLoading: true,
      outHeight: 108,
      keepSelected: true,
      notShowPrint: true,
      selectedIdKey: 'projectId',
      showSearchSwitch: true,
      scroll: {x: '1804px', y: '340px'},
      noIndex: true,
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
          title: this.projectLanguage.projectName,
          key: 'projectName',
          width: 150,
          isShowSort: true,
          configurable: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // 项目编号
          title: this.projectLanguage.projectCode,
          key: 'projectCode',
          width: 150,
          isShowSort: true,
          configurable: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // 项目规模
          title: this.projectLanguage.projectScale,
          key: 'projectScale',
          width: 150,
          isShowSort: true,
          configurable: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // 已建数量
          title: this.projectLanguage.builtCount,
          key: 'builtCount',
          width: 150,
          isShowSort: true,
          searchable: true,
          configurable: true,
          searchConfig: {type: 'input'}
        },
        { // 在建数量
          title: this.projectLanguage.buildingCount,
          key: 'buildingCount',
          width: 150,
          isShowSort: true,
          searchable: true,
          configurable: true,
          searchConfig: {type: 'input'}
        },
        { // 项目状态
          title: this.projectLanguage.projectStatus,
          key: 'status',
          type: 'render',
          renderTemplate: this.projectStatusTemp,
          width: 150,
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
        }
      ],
      showPagination: true,
      bordered: false,
      showSearch: false,
      // 勾选
      handleSelect: (event: ProjectInfoModel[]) => {
        if (!event.length) {
          this.selectProjectIds = [];
          this.projectName = '';
          this.formStatus.resetControlData('selectAreaOrProject', this.selectProjectIds);
          return;
        }
        const arr = [];
        this.selectProjectIds = [];
        event.forEach(item => {
          arr.push(item.projectName);
          this.selectProjectIds.push(item.projectId);
          this.projectName = arr.toString();
        });
        this.formStatus.resetControlData('selectAreaOrProject', this.selectProjectIds);
      },
      // 过滤查询
      handleSearch: (event: FilterCondition[]) => {
        this.projectQueryCondition.pageCondition.pageNum = 1;
        this.projectQueryCondition.filterConditions = event;
        this.refreshData();
      },
      sort: (event: SortCondition) => {
        this.projectQueryCondition.sortCondition = event;
        this.refreshData();
      },
    };
  }
}
