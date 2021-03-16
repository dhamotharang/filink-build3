import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {FacilityLanguageInterface} from '../../../../assets/i18n/facility/facility.language.interface';
import {LanguageEnum} from '../../../shared-module/enum/language.enum';
import {NzI18nService} from 'ng-zorro-antd';
import {ColumnConfig, TableConfigModel} from '../../../shared-module/model/table-config.model';
import {CommonLanguageInterface} from '../../../../assets/i18n/common/common.language.interface';
import {DeviceTypeEnum} from '../../../core-module/enum/facility/facility.enum';
import {CommonUtil} from '../../../shared-module/util/common-util';
import {EquipmentTypeEnum} from '../../../core-module/enum/equipment/equipment.enum';
import {FilterCondition, QueryConditionModel, SortCondition} from '../../../shared-module/model/query-condition.model';
import {ResultCodeEnum} from '../../../shared-module/enum/result-code.enum';
import {AssetAnalysisApiService} from '../share/service/asset-analysis/asset-analysis-api.service';
import {ResultModel} from '../../../shared-module/model/result.model';
import {AssetAnalysisStatisticalDimensionEnum} from '../share/enum/asset-analysis-statistical-dimension.enum';
import {ChartsConfig} from '../share/config/charts-config';
import {PageModel} from '../../../shared-module/model/page.model';
import {OperatorEnum} from '../../../shared-module/enum/operator.enum';
import {TableSortConfig} from '../../../shared-module/enum/table-style-config.enum';
import * as _ from 'lodash';
import {FiLinkModalService} from '../../../shared-module/service/filink-modal/filink-modal.service';
import {AssetAnalysisAssetDimensionEnum} from '../share/enum/asset-analysis-asset-dimension.enum';
import {AssetAnalysisGrowthRateEnum} from '../share/enum/asset-analysis-growth-rate.enum';
import {FacilityForCommonUtil} from '../../../core-module/business-util/facility/facility-for-common.util';


/**
 * 资产分析组件
 */
@Component({
  selector: 'app-asset-analysis',
  templateUrl: './asset-analysis.component.html',
  styleUrls: ['./asset-analysis.component.scss']
})
export class AssetAnalysisComponent implements OnInit {
  // 设施类型模板
  @ViewChild('deviceTypeTemp') deviceTypeTemp: TemplateRef<HTMLDocument>;
  // 国际化
  public commonLanguage: CommonLanguageInterface;
  // 设施语言包
  public language: FacilityLanguageInterface;
  public selectedIndex: number = 0;
  // 资产类别表格配置
  public tableConfig: TableConfigModel = new TableConfigModel();
  // 资产增长率表格配置
  public growthRateTableConfig: TableConfigModel = new TableConfigModel();
  // 资产故障分布表格配置
  public failureDistributionTableConfig: TableConfigModel = new TableConfigModel();
  // 资产占比统计图配置
  public assetRatioEchartsDataset;
  // 资产增长率统计图配置
  public assetGrowthRateEchartsDataset;
  // 资产故障分布统计图配置
  public failureDistributionEchartsDataset;
  // 资产类别表格筛选、排序或分页获取的表格数据
  public assetTypeSelectData: any = [];
  // 资产增长率表格筛选、排序或分页获取的表格数据
  public assetGrowthSelectData: any = [];
  // 资产故障分布表格筛选、排序或分页获取的表格数据
  public assetFailureSelectData: any = [];
  // 表格数据
  public dataSet: any = [];
  public growthDataSet: any = [];
  public failureDataSet: any = [];
  // 资产类别表格分页配置
  public pageBean: PageModel = new PageModel(5, 1, 1);
  // 资产增长率表格分页配置
  public growthPageBean: PageModel = new PageModel(5, 1, 1);
  // 资产故障分布表格分页配置
  public failurePageBean: PageModel = new PageModel(5, 1, 1);
  // 统计图数据
  public statisticsData: any = [];
  // 表格字段配置
  public columnConfig: ColumnConfig[] = [];
  // 资产增长率tab页是否显示表格
  public isShowTable: boolean = true;
  // 资产故障tab页是否显示表格
  public isShowFailureTable: boolean = true;
  // 设施类型枚举
  public deviceTypeEnum = DeviceTypeEnum;
  // 设备类型枚举
  public equipmentTypeEnum = EquipmentTypeEnum;
  // 是否显示资产类别统计区域
  public isShowStatisticsPart: boolean = false;
  // 是否显示资产增长率统计区域
  public isShowGrowthStatisticsPart: boolean = false;
  // 是否显示资产故障分布统计区域
  public isShowFailureStatisticsPart: boolean = false;
  // 资产增长率无数据展示
  public isNoGrowthData: boolean = false;
  // 资产故障分布无数据展示
  public isNoFailureData: boolean = false;
  // 资产占比无数据展示
  public isNoData: boolean = false;
  // 创建查询实例
  public queryCondition = new QueryConditionModel();
  // 资产类别查询实例
  public queryConditions = new QueryConditionModel();
  // 资产增长率查询实例
  public growthQueryConditions = new QueryConditionModel();
  // 资产故障分布查询实例
  public failureQueryConditions = new QueryConditionModel();
  // 根据筛选条件确定表格资产类型key值
  private assetType: string = 'deviceType';
  // 根据筛选条件确定表格资产数量key值
  private assetsNumber: string = 'deviceNum';
  // 根据筛选条件确定表格百分比key值
  private percentage: string = 'devicePercentage';
  // 根据筛选条件确定表格资产类型排序字段
  private deviceOrEquipmentType = 'deviceTypeName';
  // 保存筛选条件中的选中资产维度数据
  private statisticalDimension: string = AssetAnalysisStatisticalDimensionEnum.area;
  // 统计图title
  private title: string;
  // 增长率统计图x轴数据
  private xGrowthData = [];
  // 故障统计图x轴数据
  private xFailureData = [];
  private assetGrowthKeys = {
    GrowthAssetType: 'deviceType',
    GrowthAssetsNumber: 'deviceNum',
    GrowthRate: 'deviceTypeGrowthRate'
  };
  private growthStatic = [];
  private failureStatic = [];

  constructor(
    public $nzI18n: NzI18nService,
    public $assetAnalysisApiService: AssetAnalysisApiService,
    public $message: FiLinkModalService
  ) {
  }

  ngOnInit() {
    // 国际化
    this.language = this.$nzI18n.getLocaleData(LanguageEnum.facility);
    this.initTable();
    this.initGrowthRateTable();
    this.initFailureDistributionTable();
  }

  /**
   * 资产占比的统计条件
   * param event
   */
  public assetRatioFilterConditionEmit(event): void {
    console.log(FacilityForCommonUtil.getRoleFacility(this.$nzI18n));
    this.queryCondition.filterConditions = event.emitCondition;
    this.queryCondition.sortCondition = new SortCondition();
    // 根据筛选条件确定表格中列的key值
    if (event.assetType === AssetAnalysisAssetDimensionEnum.facility) {
      this.title = '设施资产';
      this.assetType = 'deviceType';
      this.assetsNumber = 'deviceNum';
      this.percentage = 'devicePercentage';
    } else {
      this.title = '设备资产';
      this.assetType = 'equipmentType';
      this.assetsNumber = 'equipmentNum';
      this.percentage = 'equipmentPercentage';
    }
    this.statisticalDimension = event.statisticalDimension;
    Promise.resolve().then(() => {
      this.analysis(event.assetType).then((data) => {
        this.assetRatioEchartsDataset = ChartsConfig.assetRatioStatistics(this.title, data);
        this.isNoData = Boolean(data.length);
        this.initTable();
      });
    });
  }

  /**
   * 资产增长率的统计条件
   */
  public assetGrowthRateFilterConditionEmit(event): void {
    Promise.resolve().then(() => {
      this.assetGrowthAnalysis(event).then((data) => {
        this.assetGrowthRateEchartsDataset = ChartsConfig.assetGrowthRateStatistics(this.xGrowthData, data);
        this.isNoGrowthData = Boolean(data.length);
        this.initGrowthRateTable();
      });
    });
  }

  /**
   * 资产故障分布的统计条件
   */
  public assetFailureDistributionFilterConditionEmit(event): void {
    Promise.resolve().then(() => {
      this.assetFailureAnalysis(event).then((data) => {
        this.failureDistributionEchartsDataset = ChartsConfig.assetGrowthRateStatistics(this.xFailureData, data);
        this.isNoFailureData = Boolean(data.length);
      });
    });
  }

  /**
   * 图标切换
   */
  public changeGraph(): void {
    if (this.selectedIndex === 1) {
      this.isShowTable = !this.isShowTable;
    } else {
      this.isShowFailureTable = !this.isShowFailureTable;
    }
  }

  /**
   * 分页查询
   * @param event PageModel
   */
  public pageChange(event: PageModel): void {
    switch (this.selectedIndex) {
      case 0 :
        this.pageBean.pageIndex = event.pageIndex;
        this.pageBean.pageSize = event.pageSize;
        this.filter(this.selectedIndex, this.dataSet, this.queryConditions, this.pageBean);
        break;
      case 1 :
        this.growthPageBean.pageIndex = event.pageIndex;
        this.growthPageBean.pageSize = event.pageSize;
        this.filter(this.selectedIndex, this.growthDataSet, this.growthQueryConditions, this.growthPageBean);
        break;
      case 2 :
        this.failurePageBean.pageIndex = event.pageIndex;
        this.failurePageBean.pageSize = event.pageSize;
        this.filter(this.selectedIndex, this.failureDataSet, this.failureQueryConditions, this.failurePageBean);
        break;
    }

  }

  /**
   * 根据筛选条件查询资产占比分析
   */
  private analysis(assetType): Promise<any> {
    this.isShowStatisticsPart = true;
    this.queryConditions = new QueryConditionModel();
    return new Promise((resolve, reject) => {
      // 资产统计条件为设施、区域时调用接口
      if (assetType === AssetAnalysisAssetDimensionEnum.facility) {
        this.$assetAnalysisApiService.queryDeviceTypeCountByCondition(this.queryCondition).subscribe((result: ResultModel<any>) => {
          if (result.code === ResultCodeEnum.success) {
            this.dataSet = result.data;
            this.dataSet.forEach(item => {
              item.iconClass = CommonUtil.getFacilityIConClass(item.deviceType);
              item.deviceType = CommonUtil.codeTranslate(DeviceTypeEnum, this.$nzI18n, item.deviceType, 'facility.config');
              item.deviceTypeName = CommonUtil.codeTranslate(DeviceTypeEnum, this.$nzI18n, null, 'facility.config');
              // 统一字段名，方便在html中资产类型模板显示
              item.typeName = item.deviceType;
              this.deviceOrEquipmentType = item.deviceTypeName;
            });
            this.pageBean.pageSize = 5;
            this.filter(0, this.dataSet, this.queryConditions, this.pageBean);
            this.statisticsData = result.data.map(item => {
              return {
                value: parseFloat(item.devicePercentage),
                name: item.deviceType,
              };
            });
            resolve(this.statisticsData);
          } else {
            reject();
          }
        }, () => {
          reject();
        });
      } else {
        // 资产占比统计条件为设备、区域时调用接口
        this.$assetAnalysisApiService.queryEquipmentTypeCountByCondition(this.queryCondition).subscribe((result: ResultModel<any>) => {
          if (result.code === ResultCodeEnum.success) {
            this.dataSet = result.data;
            this.dataSet.forEach(item => {
              item.iconClass = CommonUtil.getEquipmentIconClassName(item.equipmentType);
              item.equipmentType = CommonUtil.codeTranslate(EquipmentTypeEnum, this.$nzI18n, item.equipmentType, 'facility');
              item.equipmentTypeName = CommonUtil.codeTranslate(EquipmentTypeEnum, this.$nzI18n, null, 'facility');
              // 统一字段名，方便在html中资产类型模板显示
              item.typeName = item.equipmentType;
              this.deviceOrEquipmentType = item.equipmentTypeName;
            });
            this.pageBean.pageSize = 5;
            this.filter(0, this.dataSet, this.queryConditions, this.pageBean);
            this.statisticsData = result.data.map(item => {
              return {
                value: parseFloat(item.equipmentPercentage),
                name: item.equipmentType,
              };
            });
            resolve(this.statisticsData);
          } else {
            reject();
          }
        }, () => {
          reject();
        });
      }
    });

  }

  /**
   * 根据筛选条件查询资产增长率表格和统计图数据
   */
  private assetGrowthAnalysis(filterCondition): Promise<any> {
    this.isShowGrowthStatisticsPart = true;
    this.growthQueryConditions = new QueryConditionModel();
    return new Promise((resolve, reject) => {
      if (filterCondition.assetType === AssetAnalysisAssetDimensionEnum.facility) {
        this.assetGrowthKeys = {
          GrowthAssetType: 'deviceType',
          GrowthAssetsNumber: 'deviceNum',
          GrowthRate: 'deviceTypeGrowthRate'
        };
        this.$assetAnalysisApiService.queryDeviceTypeGrowthRate(filterCondition.GrowthEmitCondition).subscribe((result: ResultModel<any>) => {
          if (result.code === ResultCodeEnum.success) {
            const statisticXData = [];
            this.growthDataSet = result.data;
            this.growthDataSet.forEach(item => {
              item.iconClass = CommonUtil.getFacilityIConClass(item.deviceType);
              item.deviceType = CommonUtil.codeTranslate(DeviceTypeEnum, this.$nzI18n, item.deviceType, 'facility.config');
              item.deviceTypeName = CommonUtil.codeTranslate(DeviceTypeEnum, this.$nzI18n, null, 'facility.config');
              // 统一字段名，方便在html中资产类型模板显示
              item.typeName = item.deviceType;
              item.number = item.deviceNum;
              item.createTime = item.createTimeStamp;
              // 如果返回的增长率值为双横线，将其赋值为0，以便排序
              if (item.deviceTypeGrowthRate === '--') {
                item.growthRateSortKey = 0;
              } else {
                item.growthRateSortKey = parseFloat(item.deviceTypeGrowthRate);
              }
            });
            this.growthDataSet = this.handleTime(filterCondition.selectGrowthRateType, this.growthDataSet);
            this.growthPageBean.pageSize = 5;
            this.filter(1, this.growthDataSet, this.growthQueryConditions, this.growthPageBean);
            this.growthDataSet.forEach(item => {
              if (!statisticXData.includes(item.createTime)) {
                statisticXData.push(item.createTime);
              }
            });
            this.xGrowthData = statisticXData;
            this.growthStatic = this.handleDataSet(this.growthDataSet, statisticXData.length, 0);
            resolve(this.growthStatic);
          } else {
            reject();
          }
        });
      } else {
        this.assetGrowthKeys = {
          GrowthAssetType: 'equipmentType',
          GrowthAssetsNumber: 'equipmentNum',
          GrowthRate: 'equipmentTypeGrowthRate'
        };
        this.$assetAnalysisApiService.queryEquipmentTypeGrowthRate(filterCondition.GrowthEmitCondition).subscribe((result: ResultModel<any>) => {
          if (result.code === ResultCodeEnum.success) {
            const statisticXData = [];
            this.growthDataSet = result.data;
            this.growthDataSet.forEach(item => {
              item.iconClass = CommonUtil.getEquipmentIconClassName(item.equipmentType);
              item.equipmentType = CommonUtil.codeTranslate(EquipmentTypeEnum, this.$nzI18n, item.equipmentType, 'facility');
              item.equipmentTypeName = CommonUtil.codeTranslate(EquipmentTypeEnum, this.$nzI18n, null, 'facility');
              item.typeName = item.equipmentType;
              item.number = item.equipmentNum;
              item.createTime = item.createTimeStamp;
              // 如果返回的增长率值为双横线，将其赋值为0，以便排序
              if (item.equipmentTypeGrowthRate === '--') {
                item.growthRateSortKey = 0;
              } else {
                item.growthRateSortKey = parseFloat(item.equipmentTypeGrowthRate);
              }
            });
            this.growthDataSet = this.handleTime(filterCondition.selectGrowthRateType, this.growthDataSet);
            console.log(this.growthDataSet);
            this.growthPageBean.pageSize = 5;
            this.filter(1, this.growthDataSet, this.growthQueryConditions, this.growthPageBean);
            this.growthDataSet.forEach(item => {
              if (!statisticXData.includes(item.createTime)) {
                statisticXData.push(item.createTime);
              }
            });
            this.xGrowthData = statisticXData;
            this.growthStatic = this.handleDataSet(this.growthDataSet, statisticXData.length, 0);
            resolve(this.growthStatic);
          } else {
            reject();
          }
        });
      }
    });
  }

  /**
   * 根据筛选条件查询资产故障分布分析
   */
  private assetFailureAnalysis(filterCondition): Promise<any> {
    this.isShowFailureStatisticsPart = true;
    this.failureQueryConditions = new QueryConditionModel();
    return new Promise((resolve, reject) => {
      if (filterCondition.assetType === AssetAnalysisAssetDimensionEnum.facility) {
        this.$assetAnalysisApiService.deviceProductTroubleGrowthRate(filterCondition.GrowthEmitCondition).subscribe((result: ResultModel<any>) => {
          if (result.code === ResultCodeEnum.success) {
            const statisticXData = [];
              if (filterCondition.selectProductInformation.length) {
                this.failureDataSet = result.data || [];
                this.failureDataSet.forEach(item => {
                  if (item.troubleGrowthRate === '--') {
                    item.failureRateSortKey = 0;
                  } else {
                    item.failureRateSortKey = parseFloat(item.troubleGrowthRate);
                  }
                  filterCondition.selectProductInformation.forEach(i => {
                    if (item.productId === i.productId) {
                      item.iconClass = CommonUtil.getFacilityIConClass(i.typeCode);
                      item.typeName = CommonUtil.codeTranslate(DeviceTypeEnum, this.$nzI18n, i.typeCode, 'facility.config');
                      item.productModel = i.productModel;
                      item.supplierName = i.supplierName;
                      item.softwareVersion = i.softwareVersion;
                      item.hardwareVersion = i.hardwareVersion;
                    }
                  });
                });
                this.failureDataSet = this.handleTime(filterCondition.GrowthEmitCondition.bizCondition.growthRateDimension, this.failureDataSet);
              }
            this.failurePageBean.pageSize = 5;
            this.filter(2, this.failureDataSet, this.failureQueryConditions, this.failurePageBean);
            this.failureDataSet.forEach(item => {
              if (!statisticXData.includes(item.createTime)) {
                statisticXData.push(item.createTime);
              }
            });
            this.xFailureData = statisticXData;
            this.failureStatic = this.handleDataSet(this.failureDataSet, statisticXData.length, 1);
            resolve(this.failureStatic);
          } else {
            reject();
          }
        });
      } else {
        this.$assetAnalysisApiService.equipmentProductTroubleGrowthRate(filterCondition.GrowthEmitCondition).subscribe((result: ResultModel<any>) => {
          if (result.code === ResultCodeEnum.success) {
            const statisticXData = [];
              if (filterCondition.selectProductInformation.length) {
                this.failureDataSet = result.data || [];
                this.failureDataSet.forEach(item => {
                  if (item.troubleGrowthRate === '--') {
                    item.failureRateSortKey = 0;
                  } else {
                    item.failureRateSortKey = parseFloat(item.troubleGrowthRate);
                  }
                  filterCondition.selectProductInformation.forEach(i => {
                    if (item.productId === i.productId) {
                      item.iconClass = CommonUtil.getEquipmentIconClassName(i.typeCode);
                      item.typeName = CommonUtil.codeTranslate(EquipmentTypeEnum, this.$nzI18n, i.typeCode, 'facility');
                      item.productModel = i.productModel;
                      item.supplierName = i.supplierName;
                      item.softwareVersion = i.softwareVersion;
                      item.hardwareVersion = i.hardwareVersion;
                    }
                  });
                });
                this.failureDataSet = this.handleTime(filterCondition.GrowthEmitCondition.bizCondition.growthRateDimension, this.failureDataSet);
              }
            this.failurePageBean.pageSize = 5;
            this.filter(2, this.failureDataSet, this.failureQueryConditions, this.failurePageBean);
            this.failureDataSet.forEach(item => {
              if (!statisticXData.includes(item.createTime)) {
                statisticXData.push(item.createTime);
              }
            });
            this.xFailureData = statisticXData;
            this.failureStatic = this.handleDataSet(this.failureDataSet, statisticXData.length, 1);
            resolve(this.failureStatic);
          } else {
            reject();
          }
        });
      }
    });
  }

  /**
   * 资产占比初始化统计表格配置
   */
  private initTable(): void {
    this.tableConfig = {
      isDraggable: true,
      isLoading: false,
      outHeight: 108,
      showSizeChanger: true,
      showSearchSwitch: true,
      showPagination: true,
      pageSizeOptions: [5, 10, 20, 30, 40],
      scroll: {x: '1300px', y: '340px'},
      noIndex: true,
      notShowPrint: true,
      showSearchExport: true,
      columnConfig: [
        { // 序号
          type: 'serial-number',
          width: 62,
          title: '序号',
          fixedStyle: {fixedLeft: true, style: {left: '0px'}},
        },
        { // 资产类型
          title: this.language.assetAnalysis.assetCategory, key: this.assetType, width: 150,
          type: 'render',
          renderTemplate: this.deviceTypeTemp,
          sortKey: this.deviceOrEquipmentType,
          searchKey: this.assetType,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'},
        },
        { // 资产数量
          title: this.language.assetAnalysis.assetsNumber, key: this.assetsNumber, width: 150,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // 百分比
          title: this.language.assetAnalysis.percentage, key: this.percentage, width: 150,
          isShowSort: true,
          sortKey: this.assetsNumber,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        {
          title: this.language.operate,
          searchable: true,
          searchConfig: {
            type: 'operate',
          }, key: '', width: 100, fixedStyle: {fixedRight: true, style: {right: '0px'}}
        },
      ],
      // 排序
      sort: (event: SortCondition) => {
        this.queryConditions.sortCondition = event;
        this.filter(this.selectedIndex, this.dataSet, this.queryConditions, this.pageBean);
      },
      // 筛选
      handleSearch: (event: FilterCondition[]) => {
        event.forEach(item => {
          if (item.filterField === 'deviceType' || item.filterField === 'equipmentType') {
            item.operator = OperatorEnum.in;
          }
          if (item.filterField === 'deviceNum' || item.filterField === 'equipmentNum') {
            item.operator = OperatorEnum.eq;
            item.filterValue = Number(item.filterValue);
          }
          if (item.filterField === 'devicePercentage' || item.filterField === 'equipmentPercentage') {
            item.operator = OperatorEnum.eq;
          }
        });
        this.queryConditions.filterConditions = event;
        this.queryConditions.pageCondition.pageNum = 1;
        this.filter(this.selectedIndex, this.dataSet, this.queryConditions, this.pageBean);
      },
      // 导出
      handleExport: (event) => {
        let tableData = [];
        if (this.assetType === 'deviceType') {
          tableData = this.assetTypeSelectData.map(item => {
            const {deviceType, deviceNum, devicePercentage} = item;
            return {deviceType, deviceNum, devicePercentage};
          });
        } else {
          tableData = this.assetTypeSelectData.map(item => {
            const {equipmentType, equipmentNum, equipmentPercentage} = item;
            return {equipmentType, equipmentNum, equipmentPercentage};
          });
        }
        // 处理参数
        const body = {
          queryCondition: new QueryConditionModel(),
          // 列信息
          columnInfoList: event.columnInfoList,
          // 导出文件类型
          excelType: event.excelType,
          // 表格数据内容
          objectList: tableData
        };
        if (this.assetType === 'deviceType') {
          this.$assetAnalysisApiService.exportDeviceTypeCount(body).subscribe((result: ResultModel<any>) => {
            if (result.code === 0) {
              this.$message.success(result.msg);
            } else {
              this.$message.error(this.language.assetAnalysis.exportFailed);
            }
          });
        } else {
          this.$assetAnalysisApiService.exportEquipmentTypeCount(body).subscribe((result: ResultModel<any>) => {
            if (result.code === 0) {
              this.$message.success(result.msg);
            } else {
              this.$message.error(this.language.assetAnalysis.exportFailed);
            }
          });
        }
      }
    };
  }

  /**
   * 资产增长率初始化统计表格配置
   */
  private initGrowthRateTable(): void {
    this.growthRateTableConfig = {
      isDraggable: true,
      isLoading: false,
      outHeight: 108,
      showSizeChanger: true,
      showSearchSwitch: true,
      showPagination: true,
      pageSizeOptions: [5, 10, 20, 30, 40],
      scroll: {x: '1600px', y: '340px'},
      noIndex: true,
      notShowPrint: true,
      showSearchExport: true,
      columnConfig: [
        { // 序号
          type: 'serial-number',
          width: 62,
          title: '序号',
          fixedStyle: {fixedLeft: true, style: {left: '0px'}},
        },
        { // 时间
          title: this.language.time, key: 'createTime', width: 150,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'},
        },
        { // 资产类型
          title: this.language.assetAnalysis.assetCategory, key: this.assetGrowthKeys.GrowthAssetType, width: 150,
          type: 'render',
          renderTemplate: this.deviceTypeTemp,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'},
        },
        { // 资产数量
          title: this.language.assetAnalysis.assetsNumber, key: this.assetGrowthKeys.GrowthAssetsNumber, width: 150,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // 增长率
          title: this.language.assetAnalysis.growthRate, key: this.assetGrowthKeys.GrowthRate, width: 150,
          isShowSort: true,
          sortKey: 'growthRateSortKey',
          searchable: true,
          searchConfig: {type: 'input'}
        },
        {
          title: this.language.operate,
          searchable: true,
          searchConfig: {
            type: 'operate',
          }, key: '', width: 100, fixedStyle: {fixedRight: true, style: {right: '0px'}}
        },
      ],
      rightTopButtons: [
        {
          // 统计图表切换
          text: '图表切换',
          iconClassName: 'fiLink-analysis',
          handle: () => {
            this.changeGraph();
          }
        }
      ],
      // 排序
      sort: (event: SortCondition) => {
        this.growthQueryConditions.sortCondition = event;
        this.filter(this.selectedIndex, this.growthDataSet, this.growthQueryConditions, this.growthPageBean);
      },
      // 筛选
      handleSearch: (event: FilterCondition[]) => {
        event.forEach(item => {
          if (item.filterField === 'deviceNum' || item.filterField === 'equipmentNum') {
            item.operator = OperatorEnum.eq;
            item.filterValue = Number(item.filterValue);
          }
          if (item.filterField === 'deviceTypeGrowthRate' || item.filterField === 'equipmentTypeGrowthRate') {
            item.operator = OperatorEnum.eq;
          }
        });
        this.growthQueryConditions.filterConditions = event;
        this.growthQueryConditions.pageCondition.pageNum = 1;
        this.filter(this.selectedIndex, this.growthDataSet, this.growthQueryConditions, this.growthPageBean);
      },
      // 导出
      handleExport: (event) => {
        let tableData = [];
        if (this.assetGrowthKeys.GrowthAssetType === 'deviceType') {
          tableData = this.assetGrowthSelectData.map(item => {
            const {createTime, deviceType, deviceNum, deviceTypeGrowthRate} = item;
            return {createTime, deviceType, deviceNum, deviceTypeGrowthRate};
          });
        } else {
          tableData = this.assetGrowthSelectData.map(item => {
            const {createTime, equipmentType, equipmentNum, equipmentTypeGrowthRate} = item;
            return {createTime, equipmentType, equipmentNum, equipmentTypeGrowthRate};
          });
        }
        // 处理参数
        const body = {
          queryCondition: new QueryConditionModel(),
          // 列信息
          columnInfoList: event.columnInfoList,
          // 导出文件类型
          excelType: event.excelType,
          // 表格数据内容
          objectList: tableData
        };
        if (this.assetGrowthKeys.GrowthAssetType === 'deviceType') {
          this.$assetAnalysisApiService.exportDeviceTypeGrowthRate(body).subscribe((result: ResultModel<any>) => {
            if (result.code === 0) {
              this.$message.success(result.msg);
            } else {
              this.$message.error(this.language.assetAnalysis.exportFailed);
            }
          });
        } else {
          this.$assetAnalysisApiService.exportEquipmentTypeGrowthRate(body).subscribe((result: ResultModel<any>) => {
            if (result.code === 0) {
              this.$message.success(result.msg);
            } else {
              this.$message.error(this.language.assetAnalysis.exportFailed);
            }
          });
        }
      }
    };
  }

  /**
   * 资产故障分布初始化统计表格配置
   */
  private initFailureDistributionTable(): void {
    this.failureDistributionTableConfig = {
      isDraggable: true,
      isLoading: false,
      outHeight: 108,
      showSizeChanger: true,
      showSearchSwitch: true,
      showPagination: true,
      pageSizeOptions: [5, 10, 20, 30, 40],
      scroll: {x: '1600px', y: '340px'},
      noIndex: true,
      notShowPrint: true,
      showSearchExport: true,
      columnConfig: [
        { // 序号
          type: 'serial-number',
          width: 62,
          title: '序号',
          fixedStyle: {fixedLeft: true, style: {left: '0px'}},
        },
        { // 时间
          title: this.language.time, key: 'createTime', width: 150,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'},
          fixedStyle: {fixedLeft: true, style: {left: '62px'}},
        },
        { // 资产类型
          title: this.language.assetAnalysis.assetCategory, key: 'typeName', width: 150,
          type: 'render',
          renderTemplate: this.deviceTypeTemp,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'},
        },
        { // 规格型号
          title: this.language.assetAnalysis.productModel, key: 'productModel', width: 150,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // 供应商
          title: this.language.assetAnalysis.supplier, key: 'supplierName', width: 150,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // 软件版本
          title: this.language.assetAnalysis.softwareVersion, key: 'softwareVersion', width: 150,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // 硬件版本
          title: this.language.assetAnalysis.hardwareVersion, key: 'hardwareVersion', width: 150,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // 故障数
          title: this.language.assetAnalysis.failuresNumber, key: 'troubleNum', width: 150,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // 故障增长率
          title: this.language.assetAnalysis.failureRate, key: 'troubleGrowthRate', width: 150,
          isShowSort: true,
          sortKey: 'failureRateSortKey',
          searchable: true,
          searchConfig: {type: 'input'},
          fixedStyle: {fixedRight: true, style: {right: '0'}}
        },
        {
          title: this.language.operate,
          searchable: true,
          searchConfig: {
            type: 'operate',
          }, key: '', width: 100, fixedStyle: {fixedRight: true, style: {right: '0px'}}
        },
      ],
      rightTopButtons: [
        {
          // 统计图表切换
          text: '图表切换',
          iconClassName: 'fiLink-analysis',
          handle: () => {
            this.changeGraph();
          }
        }
      ],
      // 排序
      sort: (event: SortCondition) => {
        this.failureQueryConditions.sortCondition = event;
        this.filter(this.selectedIndex, this.failureDataSet, this.failureQueryConditions, this.failurePageBean);
      },
      // // 筛选
      handleSearch: (event: FilterCondition[]) => {
        event.forEach(item => {
          if (item.filterField === 'troubleNum' || item.filterField === 'troubleGrowthRate') {
            item.operator = OperatorEnum.eq;
          }
        });
        this.failureQueryConditions.filterConditions = event;
        this.failureQueryConditions.pageCondition.pageNum = 1;
        this.filter(this.selectedIndex, this.failureDataSet, this.failureQueryConditions, this.failurePageBean);
      },
      // 导出
      handleExport: (event) => {
        let failureTableData: any[];
        failureTableData = this.assetFailureSelectData.map(item => {
            const {createTime, typeName, productModel, supplierName, softwareVersion, hardwareVersion, troubleNum, troubleGrowthRate} = item;
            return {createTime, typeName, productModel, supplierName, softwareVersion, hardwareVersion, troubleNum, troubleGrowthRate};
          });
        // 处理参数
        const body = {
          queryCondition: new QueryConditionModel(),
          // 列信息
          columnInfoList: event.columnInfoList,
          // 导出文件类型
          excelType: event.excelType,
          // 表格数据内容
          objectList: failureTableData
        };
          this.$assetAnalysisApiService.exportProductTroubleGrowthRate(body).subscribe((result: ResultModel<any>) => {
            if (result.code === ResultCodeEnum.success) {
              this.$message.success(result.msg);
            } else {
              this.$message.error(this.language.assetAnalysis.exportFailed);
            }
          });
      }
    };
  }

  private filter(index, data, filterCondition, pageBean): any {
    // 搜索逻辑
    let searchData = [];
    if (filterCondition.filterConditions.length) {
      searchData = data.filter(item => {
        return filterCondition.filterConditions.every(_item => {
          if (_item.operator === OperatorEnum.eq) {
            return item[_item.filterField] === _item.filterValue;
          } else if (_item.operator === OperatorEnum.in) {
            return _item.filterValue.includes(item[_item.filterField]);
          } else {
            return item[_item.filterField].includes(_item.filterValue);
          }
        });
      });
    } else {
      searchData = data;
    }
    // 排序逻辑
    let sortDataSet = [];
    if (filterCondition.sortCondition && filterCondition.sortCondition.sortRule) {
      sortDataSet = _.sortBy(searchData, filterCondition.sortCondition.sortField);
      if (filterCondition.sortCondition.sortRule === TableSortConfig.DESC) {
        sortDataSet.reverse();
      }
    } else {
      sortDataSet = searchData;
    }
    const selectData = sortDataSet.slice(pageBean.pageSize * (pageBean.pageIndex - 1),
      pageBean.pageIndex * pageBean.pageSize);
    switch (index) {
      case 0 :
        this.assetTypeSelectData = selectData;
        this.pageBean.Total = sortDataSet.length;
        break;
      case 1 :
        this.assetGrowthSelectData = selectData;
        this.growthPageBean.Total = sortDataSet.length;
        break;
      case 2 :
        this.assetFailureSelectData = selectData;
        this.failurePageBean.Total = sortDataSet.length;
        break;
    }
  }

   /**
   * 将接口返回的数据处理成统计图数据格式
   */
  private handleDataSet(data, size, number): any[] {
    const result = [];
    const staticData = [];
     for (let i = 0; i < data.length; i += size) {
       result.push(data.slice(i, i + size));
     }
     switch (number) {
       case 0 :
         result.forEach(item => {
           const growthNum = [];
           const growthRate = [];
           item.forEach( i => {
             growthNum.push(i.number);
             growthRate.push(i.growthRateSortKey);
           });
           staticData.push({
             name: item[0].typeName,
             type: 'bar',
             data: growthNum,
             barGap: '0%',
           });
           staticData.push({
             name: `${item[0].typeName}增长率`,
             type: 'line',
             data: growthRate,
             label: {
               normal: {
                 formatter: '{b} \n {c}%',
               },
             },
             yAxisIndex: 1,
           });
         });
         break;
       case 1 :
         result.forEach(item => {
           const growthNum = [];
           const growthRate = [];
           item.forEach( i => {
             growthNum.push(i.troubleNum);
             growthRate.push(i.failureRateSortKey);
           });
           staticData.push({
             name: item[0].productModel,
             type: 'bar',
             data: growthNum,
             barGap: '0%',
           });
           staticData.push({
             name: `${item[0].productModel}增长率`,
             type: 'line',
             data: growthRate,
             label: {
               normal: {
                 formatter: '{b} \n {c}%',
               },
             },
             yAxisIndex: 1,
           });
         });
         break;
     }
    console.log(staticData);
    return staticData;
  }

  /**
   * 对接口返回时间进行处理，以便统计表图展示
   */
  private handleTime(growthType, dataSet): any[] {
    switch (growthType) {
      case AssetAnalysisGrowthRateEnum.monthlyGrowth :
        dataSet.forEach( data => {
          data.createTime = (CommonUtil.dateFmt('yyyy年MM月', new Date(data.createTime)));
        });
        break;
      case AssetAnalysisGrowthRateEnum.annualGrowth :
        dataSet.forEach( data => {
          data.createTime = (CommonUtil.dateFmt('yyyy年', new Date(data.createTime)));
        });
        break;
      case AssetAnalysisGrowthRateEnum.dailyGrowth :
        dataSet.forEach( data => {
          data.createTime = (CommonUtil.dateFmt('yyyy年MM月dd日', new Date(data.createTime)));
        });
        break;
    }
    return dataSet;
  }
}
