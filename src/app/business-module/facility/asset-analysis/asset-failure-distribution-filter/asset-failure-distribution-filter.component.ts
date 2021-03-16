import {Component, EventEmitter, OnInit, OnChanges, SimpleChanges, Input, Output, TemplateRef, ViewChild} from '@angular/core';
import {FacilityLanguageInterface} from '../../../../../assets/i18n/facility/facility.language.interface';
import {FormItem} from '../../../../shared-module/component/form/form-config';
import {NzI18nService} from 'ng-zorro-antd';
import {LanguageEnum} from '../../../../shared-module/enum/language.enum';
import {CommonUtil} from '../../../../shared-module/util/common-util';
import {DeviceSortEnum, DeviceTypeEnum} from '../../../../core-module/enum/facility/facility.enum';
import {AssetAnalysisStatisticalDimensionEnum} from '../../share/enum/asset-analysis-statistical-dimension.enum';
import {AssetAnalysisGrowthRateEnum} from '../../share/enum/asset-analysis-growth-rate.enum';
import {TimerSelectorService} from '../../../../shared-module/service/time-selector/timer-selector.service';
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
import {ProductTypeEnum, ProductUnitEnum} from '../../../../core-module/enum/product/product.enum';
import {EquipmentListModel} from '../../../../core-module/model/equipment/equipment-list.model';
import {ProductForCommonService} from '../../../../core-module/api-service/product/product-for-common.service';
import {TableConfigModel} from '../../../../shared-module/model/table-config.model';
import {ProductLanguageInterface} from '../../../../../assets/i18n/product/product.language.interface';
import {CommonLanguageInterface} from '../../../../../assets/i18n/common/common.language.interface';
import {PageModel} from '../../../../shared-module/model/page.model';
import * as _ from 'lodash';
import {TableComponent} from '../../../../shared-module/component/table/table.component';
import {EquipmentTypeEnum} from '../../../../core-module/enum/equipment/equipment.enum';
import {PlanProjectLanguageInterface} from '../../../../../assets/i18n/plan-project/plan-project.language.interface';
import {ProjectStatusEnum} from '../../../plan-project/share/enum/project-status.enum';
import {ProjectStatusIconEnum} from '../../../plan-project/share/enum/project-status-icon.enum';
import {AssetAnalysisApiService} from '../../share/service/asset-analysis/asset-analysis-api.service';
import {ProjectInfoModel} from '../../../plan-project/share/model/project-info.model';
import {AssetAnalysisAssetDimensionEnum} from '../../share/enum/asset-analysis-asset-dimension.enum';
import {SelectModel} from '../../../../shared-module/model/select.model';
import {
  PRODUCT_DEVICE_TYPE_CONST,
  PRODUCT_EQUIPMENT_TYPE_CONST
} from '../../../../core-module/const/product/product-common.const';
import {differenceInCalendarDays} from 'date-fns';

/**
 * 资产分析-资产故障分布组件
 */
@Component({
  selector: 'app-asset-failure-distribution-filter',
  templateUrl: './asset-failure-distribution-filter.component.html',
  styleUrls: ['./asset-failure-distribution-filter.component.scss']
})
export class AssetFailureDistributionFilterComponent implements OnInit, OnChanges {
  // 当前选中tab页
  @Input() public selectedIndex = 0;
  // 将查询条件传给父组件
  @Output() public assetFailureDistributionFilterConditionEmit = new EventEmitter<any>();
  // 资产类别选择模板
  @ViewChild('selectAssetType') public selectAssetType: TemplateRef<HTMLDocument>;
  // 区域选择模版
  @ViewChild('AreaSelectRef') public AreaSelectRef: TemplateRef<HTMLDocument>;
  // 项目弹窗模版
  @ViewChild('ProjectSelectRef') public ProjectSelectRef: TemplateRef<HTMLDocument>;
  // 项目列表
  @ViewChild('projectListTable') public projectListTable: TableComponent;
  // 项目列表设施状态模板
  @ViewChild('projectStatusTemp') projectStatusTemp: TemplateRef<HTMLDocument>;
  // 类型选择模版
  @ViewChild('chooseTypeRef') public chooseTypeRef: TemplateRef<HTMLDocument>;
  // 月增长率时间选择模版
  @ViewChild('SelectTime') public SelectTime: TemplateRef<HTMLDocument>;
  // 日增长率时间选择模版
  @ViewChild('dailySelectTime') public dailySelectTime: TemplateRef<HTMLDocument>;
  // 年增长率时间选择模版
  @ViewChild('yearSelectTime') public yearSelectTime: TemplateRef<HTMLDocument>;
  // 按钮模板
  @ViewChild('buttonTemplate') public buttonTemplate: TemplateRef<HTMLDocument>;
  //  产品类型模版
  @ViewChild('productTypeTemplate') public productTypeTemplate: TemplateRef<HTMLDocument>;
  // 产品型号列表
  @ViewChild('productListTable') public productListTable: TableComponent;
  // 产品计量单位枚举
  @ViewChild('unitTemplate') public unitTemplate: TemplateRef<HTMLDocument>;
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
  public productLanguage: ProductLanguageInterface;
  // 资产类别多选下拉框数据
  public assetTypeData: any[] = [];
  // 资产类多选下拉框选中数据
  public assetTypeSelectData: any[] = [];
  // 资产类别多选下拉框数据code码集合
  public assetTypeCodeList: any[] = [];
  // 设施类型枚举
  public deviceTypeEnum = DeviceTypeEnum;
  // 产品类型枚举
  public productTypeEnum = ProductTypeEnum;
  // 产品计量单位枚举
  public productUnitEnum = ProductUnitEnum;
  // 设备类型枚举
  public equipmentTypeEnum = EquipmentTypeEnum;
  // form表单配置
  public formColumn: FormItem[] = [];
  // 区域树配置
  public treeSelectorConfig: TreeSelectorConfigModel;
  // 产品型号表格配置
  public tableConfig: TableConfigModel = new TableConfigModel();
  // 区域树数据
  public treeNodes: AreaModel[];
  // 区域名称
  public areaName: string = '';
  // 型号id集合
  public selectProductIds: string[] = [];
  // 型号名称
  public productName: string = '';
  // 区域选择器显示控制
  public isVisible: boolean = false;
  // 区域id集合
  public selectAreaIds: string[] = [];
  // 选择项目弹窗显示
  public isShowProjectList: boolean = false;
  // 勾选项目id集合
  public selectProjectIds: string[] = [];
  // 勾选项目名称
  public projectName: string = '';
  // 项目列表配置
  public projectTableConfig: TableConfigModel = new TableConfigModel();
  // 项目列表分页
  public projectPageBean: PageModel = new PageModel();
  // 项目列表查询条件
  public projectQueryCondition = new QueryConditionModel();
  // 项目列表数据
  public dataSet: any[] = [];
  // 资产占比表单实例
  public formStatus: FormOperate;
  // 分析按钮是否可以点击
  public isClick: boolean = false;
  // 产品列表查询条件
  public queryCondition: QueryConditionModel = new QueryConditionModel();
  // 分页
  public pageBean: PageModel = new PageModel();
  // 选中的筛选条件
  public filterCondition: any;
  // 时间选择器默认时间
  public date: Date[] = [];
  // 选择型号弹窗显示
  public isShow: boolean = false;
  public _dataSet: any[] = [];
  // 判断是否第一次点击tab页
  private isFirstClick: boolean = true;
  // 表单筛选默认条件
  private formDefaultValue = {
    // 资产维度默认值设施
    assetDimension: AssetAnalysisAssetDimensionEnum.facility,
    // 资产类别默认值智慧杆
    assetType: [],
    // 统计维度默认值区域
    statisticalDimension: AssetAnalysisStatisticalDimensionEnum.area,
    selectAreaOrProject: [],
    // 增长率默认值月增长
    growthRate: AssetAnalysisGrowthRateEnum.monthlyGrowth,
  };
  // 获取全部区域数据
  private allAreaIdList = [];
  // 全部区域名拼接字符串
  private allAreaName: string;
  private productParameterName: string;
  private statisticalDimensionParamName: string;
  private assetDimensionParamName: string;
  private selectProductInformation = [];

  constructor(
    public $nzI18n: NzI18nService,
    // 设施功能服务
    public $facilityCommonService: FacilityForCommonService,
    public $assetAnalysisApiService: AssetAnalysisApiService,
    private $message: FiLinkModalService,
    private $timerSelectorService: TimerSelectorService,
    private $productCommonService: ProductForCommonService,
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    // 判断是否为当前点击的tab页和是否为第一次点击，防止接口默认调用
    if (changes.selectedIndex.currentValue === 2 && this.isFirstClick) {
      this.isFirstClick = false;
      this.assetTypeData = FacilityForCommonUtil.getRoleFacility(this.$nzI18n).slice(1, 3);
      this.assetTypeCodeList = this.assetTypeData.map(item => {
        return item.code;
      });
      if (this.assetTypeCodeList.includes(DeviceSortEnum.pole)) {
        this.assetTypeSelectData = [DeviceSortEnum.pole];
      }
      this.queryCondition.filterConditions = [{
        filterValue: this.assetTypeSelectData,
        filterField: 'typeCode',
        operator: 'in'}];
      this.getAreaTreeData().then(() => {
        this.initColumn();
        this.initTableConfig();
      }, () => {
        this.initColumn();
        this.initTableConfig();
      }).catch(() => {
        this.initColumn();
        this.initTableConfig();
      });
    }
  }

  ngOnInit() {
    // 国际化
    this.language = this.$nzI18n.getLocaleData(LanguageEnum.facility);
    this.productLanguage = this.$nzI18n.getLocaleData(LanguageEnum.product);
    this.commonLanguage = this.$nzI18n.getLocaleData(LanguageEnum.common);
    this.projectLanguage = this.$nzI18n.getLocaleData(LanguageEnum.planProject);
    this.initTreeSelectorConfig();
    this.initTableConfig();
    this.initProjectTableConfig();
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
   * 设备选择modal
   */
  public showProductSelectorModal(): void {
    this.isShow = true;
  }

  /**
   * 表单实例对象
   * param event
   */
  public formInstance(event: { instance: FormOperate }): void {
    if (!this.formColumn.length) {
      return;
    }
    this.queryProductList();
    this.formStatus = event.instance;
    this.formStatus.group.statusChanges.subscribe(() => {
      this.isClick = !this.formStatus.getValid();
    });
    this.formStatus.resetData(this.formDefaultValue);
    this.formStatus.resetControlData('assetType', this.assetTypeSelectData);
    this.formStatus.resetControlData('chooseType', this.selectProductIds);
    this.formStatus.resetControlData('selectAreaOrProject', this.allAreaIdList);
    this.formStatus.resetControlData('selectTime', this.date);
    this.formStatus.resetControlData('operation', 'button');
    this.formStatus.resetControlData('operation', 'button');
    if (!this.isClick) {
      this.assetFailureDistributionAnalysis();
    }
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
    this.isShowProjectList = true;
  }

  /**
   * 点击取消关闭选择项目列表弹窗
   */
  public handleCancelProjectList(): void {
    this.isShowProjectList = false;
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

  public assetFailureDistributionAnalysis(): void {
    const data = this.formStatus.getData();
    if (data.assetDimension === AssetAnalysisAssetDimensionEnum.facility) {
      this.assetDimensionParamName = data.assetDimension;
      this.productParameterName = 'deviceProductId';
      if (data.statisticalDimension === AssetAnalysisStatisticalDimensionEnum.area) {
        this.statisticalDimensionParamName = 'deviceAreaId';
      } else {
        this.statisticalDimensionParamName = 'deviceProjectId';
      }
    } else {
      this.assetDimensionParamName = 'equipment.equipmentType';
      this.productParameterName = 'equipment.equipmentProductId';
      this.statisticalDimensionParamName = 'equipment.equipmentAreaId';
    }
    const queryConditions = new QueryConditionModel();
    queryConditions.filterConditions = [{
      filterField: this.assetDimensionParamName,
      operator: 'in',
      filterValue: data.assetType
    },
      {
        filterField: 'createTime',
        operator: 'gte',
        filterValue: data.selectTime[0].getTime()
      },
      {
        filterField: 'createTime',
        operator: 'lte',
        // 时间控制件获取的时间为当前时间0时0分0秒，处理时间为当前时间的24时59分59秒
        filterValue: (data.selectTime[1].getTime() + 24 * 60 * 60 * 1000 - 1)
      },
      {
        filterField: this.statisticalDimensionParamName,
        operator: 'in',
        filterValue: data.selectAreaOrProject
      },
      {
        filterField: this.productParameterName,
        operator: 'in',
        filterValue: data.chooseType
      }];
    queryConditions.bizCondition = {
      growthRateDimension: data.growthRate
    };
    this.filterCondition = {
      assetType: data.assetDimension,
      GrowthEmitCondition: queryConditions,
      selectProductInformation: this.selectProductInformation,
    };
    this.assetFailureDistributionFilterConditionEmit.emit(this.filterCondition);
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
    this.selectProductIds = [];
    this.productName = '';
    this.productListTable.checkAll(false);
    this.selectAreaIds = this.allAreaIdList;
    const date = this.$timerSelectorService.getYearRange();
    this.date = [new Date(_.first(date)), new Date()];
    this.formStatus.resetControlData('chooseType', this.selectProductIds);
    this.formStatus.resetControlData('selectAreaOrProject', this.allAreaIdList);
    this.formStatus.resetControlData('selectTime', this.date);
    this.formStatus.resetControlData('operation', 'button');
    this.areaName = this.allAreaName;
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
   * 资产类别多选下拉框勾选改变
   */
  public onChangeAssetType(event): void {
    this.assetTypeSelectData = event;
    this.selectProductIds = [];
    this.productName = '';
    this.formStatus.resetControlData('chooseType', this.selectProductIds);
    this.productListTable.checkAll(false);
    // 型号列表根据选择的类型获取列表数据
    this.queryCondition.filterConditions = [{
      filterValue: this.assetTypeSelectData,
      filterField: 'typeCode',
      operator: 'in'}];
    if (event.length) {
      this.formStatus.resetControlData('assetType', event);
    } else {
      this.formStatus.resetControlData('assetType', null);
    }
    this.initTableConfig();
    this.queryProductList();
}

  /**
   * 时间选择器数据改变
   */
  public onChange(event): void {
    // 当选择了时间，并且开始时间小于结束时间时，按钮可以点击，否则置灰
    if (event && this.date[0] && this.date[1] && this.date[0].getTime() < this.date[1].getTime()) {
      this.formStatus.resetControlData('selectTime', this.date);
    } else {
      this.formStatus.resetControlData('selectTime', []);
    }
  }

  /**
   * 点击取消关闭选择型号弹窗
   */
  public handleCancel(): void {
    this.isShow = false;
  }

  /**
   * 项目列表分页查询
   * @param event PageModel
   */
  public projectPageChange(event: PageModel): void {
    this.projectQueryCondition.pageCondition.pageNum = event.pageIndex;
    this.projectQueryCondition.pageCondition.pageSize = event.pageSize;
    this.refreshData();
  }

  /**
   * 产品列表分页查询
   * @param event PageModel
   */
  public productPageChange(event: PageModel): void {
    this.queryCondition.pageCondition.pageNum = event.pageIndex;
    this.queryCondition.pageCondition.pageSize = event.pageSize;
    this.queryProductList();
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
              this.assetTypeData = FacilityForCommonUtil.getRoleFacility(this.$nzI18n).slice(1, 3);
              this.assetTypeSelectData = [];
              statisticalDimensionColumn.selectInfo.data = CommonUtil.codeTranslate(AssetAnalysisStatisticalDimensionEnum, this.$nzI18n, null, `${LanguageEnum.facility}.assetAnalysis`);
            }
          } else {
            if (assetTypeColumn && statisticalDimensionColumn) {
              this.formStatus.resetControlData('assetType', null);
              this.formStatus.resetControlData('statisticalDimension', AssetAnalysisStatisticalDimensionEnum.area);
              this.assetTypeData = FacilityForCommonUtil.getRoleEquipmentType(this.$nzI18n).filter(item => item.label !== this.language.intelligentEntranceGuardLock);
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
      // 选择型号
      {
        label: this.language.assetAnalysis.chooseType,
        key: 'chooseType',
        type: 'custom',
        col: 8,
        require: true,
        disabled: false,
        rule: [{required: true}],
        template: this.chooseTypeRef,
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
      // 故障增长率
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
          data: CommonUtil.codeTranslate(AssetAnalysisGrowthRateEnum, this.$nzI18n, null, `${LanguageEnum.facility}.assetAnalysis`),
          label: 'label',
          value: 'code'
        },
        modelChange: (controls, $event) => {
          const selectTimeColumn = this.formColumn.find(item => item.key === 'selectTime');
          if (selectTimeColumn) {
            if ($event === AssetAnalysisGrowthRateEnum.dailyGrowth) {
              selectTimeColumn.template = this.dailySelectTime;
              const dates = this.$timerSelectorService.getMonthRange();
              this.date = [new Date(_.first(dates)), new Date()];
              this.formStatus.resetControlData('selectTime', this.date);
            } else if ($event === AssetAnalysisGrowthRateEnum.monthlyGrowth) {
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
      },
      // 分析和重置按钮
      {
        label: '',
        key: 'operation',
        type: 'custom',
        col: 8,
        require: false,
        disabled: false,
        rule: [{required: true}],
        template: this.buttonTemplate,
      }
    ];
    // 默认时间值
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

  private initTableConfig(): void {
    if (!_.isEmpty(this.selectProductIds)) {
      this.productListTable.checkAll(false);
    }
    this.tableConfig = {
      isDraggable: true,
      isLoading: false,
      outHeight: 108,
      showRowSelection: false,
      keepSelected: true,
      selectedIdKey: 'productId',
      showSizeChanger: true,
      notShowPrint: true,
      showSearchSwitch: true,
      showPagination: true,
      scroll: {x: '800px', y: '340px'},
      noIndex: true,
      columnConfig: [
        {
          type: 'select',
          width: 50,
          fixedStyle: {fixedLeft: true, style: {left: '0px'}},
        },
        { // 序号
          type: 'serial-number',
          width: 62,
          title: this.productLanguage.serialNum,
          fixedStyle: {fixedLeft: true, style: {left: '50px'}},
        },
        { // 规格型号
          title: this.productLanguage.productModel, key: 'productModel', width: 150,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // 类型
          title: this.productLanguage.model, key: 'typeCode', width: 150,
          type: 'render',
          renderTemplate: this.productTypeTemplate,
          isShowSort: true,
          searchable: true,
          searchConfig: {
            type: 'select',
            selectType: 'multiple',
            selectInfo: this.getProductTypeSelect(),
            label: 'label',
            value: 'code'
          }
        },
        { // 供应商
          title: this.productLanguage.supplier, key: 'supplierName', width: 150,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // 产品功能
          title: this.productLanguage.productFeatures, key: 'description', width: 150,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // 计量单位
          title: this.productLanguage.unit, key: 'unit', width: 100,
          type: 'render',
          renderTemplate: this.unitTemplate,
          isShowSort: true,
          searchable: true,
          searchConfig: {
            type: 'select',
            selectInfo: CommonUtil.codeTranslate(ProductUnitEnum, this.$nzI18n, null, LanguageEnum.product),
            label: 'label',
            value: 'code'
          }
        },
        { // 报废年限
          title: this.productLanguage.scrapTime, key: 'scrapTime', width: 100,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // 操作列
          title: this.productLanguage.operate,
          searchable: true,
          searchConfig: {type: 'operate'},
          key: '', width: 180,
          fixedStyle: {fixedLeft: true, style: {right: '0px'}},
        },
      ],
      sort: (event: SortCondition) => {
        this.queryCondition.sortCondition = event;
        this.queryProductList();
      },
      handleSearch: (event: FilterCondition[]) => {
        event.forEach(item => {
          if (item.filterField === 'scrapTime' || item.filterField === 'scrapTime') {
            item.operator = 'eq';
          }
        });
        this.queryCondition.filterConditions = event;
        this.queryProductList();
      },
      handleSelect: (event: any[], data) => {
        this.selectProductInformation = event;
        if (!event.length) {
          this.selectProductIds = [];
          this.productName = '';
          this.formStatus.resetControlData('chooseType', this.selectProductIds);
          return;
        }
        // 型号最多选择5种类型
        if (event.length > 5) {
          this.$message.info(this.language.assetAnalysis.selectProductNumTip);
          setTimeout(() => {
            if (data) {
              data.checked = false;
              this.productListTable.collectSelectedId(data.checked, data);
              this.productListTable.updateSelectedData();
            } else {
              event.forEach((item, index) => {
                if (index > 4) {
                  item.checked = false;
                  this.productListTable.collectSelectedId(item.checked, item);
                  this.productListTable.updateSelectedData();
                }
              });
            }
            this.productListTable.checkStatus();
          });

        }
        const arr = [];
        this.selectProductIds = [];
        // 点击全选按钮时event的值为全部产品集，取选中的前5个产品
        event.forEach((item, index) => {
          if (index < 5) {
            arr.push(item.productModel);
            this.selectProductIds.push(item.productId);
            this.productName = arr.toString();
          }
        });
        this.formStatus.resetControlData('chooseType', this.selectProductIds);
      }
    };
  }

  /**
   * 项目列表初始化
   */
  private initProjectTableConfig() {
    if (!_.isEmpty(this.selectProjectIds)) {
      this.projectListTable.checkAll(false);
    }
    this.projectTableConfig = {
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

  /**
   * 查询产品列表
   */
  private queryProductList(): void {
    this.tableConfig.isLoading = true;
    this.$productCommonService.queryProductList(this.queryCondition).subscribe((res: ResultModel<any>) => {
      if (res.code === ResultCodeEnum.success) {
        this._dataSet = res.data || [];
        this.pageBean.pageIndex = res.pageNum;
        this.pageBean.Total = res.totalCount;
        this.pageBean.pageSize = res.size;
        this.tableConfig.isLoading = false;
        // 获取设备和设施的图标
        if (!_.isEmpty(this._dataSet)) {
          this._dataSet.forEach(item => {
            item.checked = true;
            this.productListTable.updateSelectedDataNoCheck();
            if (String(item.typeFlag) === String(ProductTypeEnum.facility)) {
              item.iconClass = CommonUtil.getFacilityIConClass(item.typeCode);
            } else {
              item.iconClass = CommonUtil.getEquipmentTypeIcon(item as EquipmentListModel);
            }
          });
        }
      } else {
        this.tableConfig.isLoading = false;
      }
    }, () => {
      this.tableConfig.isLoading = false;
    });
  }

  /**
   * 刷新项目列表
   */
  private refreshData(): void {
    this.projectTableConfig.isLoading = true;
    this.$assetAnalysisApiService.queryProjectInfoListByPage(this.projectQueryCondition).subscribe((res) => {
      this.projectTableConfig.isLoading = false;
      if (res.code === ResultCodeEnum.success) {
        this.dataSet = res.data || [];
        this.dataSet.forEach(item => {
          item.statusIconClass = ProjectStatusIconEnum[item.status];
        });
        this.projectPageBean.pageIndex = res.pageNum;
        this.projectPageBean.Total = res.totalCount;
        this.projectPageBean.pageSize = res.size;
      }
    });
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
   * 获取产品类型下拉选
   */
  private getProductTypeSelect(): SelectModel[] {
    let selectData = [];
    this.assetTypeSelectData.forEach(item => {
      selectData = selectData.concat(this.assetTypeData.filter(data => item === data.code));
    });
    return selectData;
  }
}
