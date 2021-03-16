import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {NzI18nService} from 'ng-zorro-antd';
import * as _ from 'lodash';
import {IndexApiService} from '../../service/index/index-api.service';
import {MapCoverageService} from '../../../../shared-module/service/index/map-coverage.service';
import {EquipmentListModel, FacilityListModel} from '../../shared/model/facility-equipment-config.model';
import {ResultModel} from '../../../../shared-module/model/result.model';
import {
  FilterCondition,
  QueryConditionModel,
  SortCondition
} from '../../../../shared-module/model/query-condition.model';
import {ResultCodeEnum} from 'src/app/shared-module/enum/result-code.enum';
import {OperatorEnum} from '../../../../shared-module/enum/operator.enum';
import {PositionService} from '../../service/position.service';
import {FiLinkModalService} from '../../../../shared-module/service/filink-modal/filink-modal.service';
import {PageSizeEnum} from '../../../../shared-module/enum/page-size.enum';
import {TableConfigModel} from '../../../../shared-module/model/table-config.model';
import {PageModel} from '../../../../shared-module/model/page.model';
import {IndexLanguageInterface} from '../../../../../assets/i18n/index/index.language.interface';
import {FacilityForCommonUtil} from '../../../../core-module/business-util/facility/facility-for-common.util';
import {EquipmentListResultModel} from '../../shared/model/facilities-card.model';
import {TableComponent} from '../../../../shared-module/component/table/table.component';
import {MapStoreService} from '../../../../core-module/store/map.store.service';
import {SessionUtil} from '../../../../shared-module/util/session-util';
import {
  DeviceStatusEnum,
  DeviceTypeEnum,
  FacilityListTypeEnum
} from '../../../../core-module/enum/facility/facility.enum';
import {CommonUtil} from '../../../../shared-module/util/common-util';
import {LanguageEnum} from '../../../../shared-module/enum/language.enum';
import {EquipmentStatusEnum, EquipmentTypeEnum} from '../../../../core-module/enum/equipment/equipment.enum';
import {EquipmentModel} from '../../../../core-module/model/equipment/equipment.model';


@Component({
  selector: 'app-planning-liat-left-card',
  templateUrl: './planning-liat-left-card.component.html',
  styleUrls: ['./planning-liat-left-card.component.scss']
})
export class PlanningLiatLeftCardComponent implements OnInit, OnChanges {
  // 设施选择器选择结果
  @Input() facilityData: string[] = [];
  // 设备选择器选择结果
  @Input() equipmentData: string[] = [];
  // 区域选择器选择结果
  @Input() areaData: string[] = [];
  // 规划选择器选择结果
  @Input() planningData: string[] = [];
  // 智慧杆型号选择器选择结果
  @Input() smartPoleModelData: string[] = [];
  // 建设状态选择器选择结果
  @Input() constructionStatusData: string[] = [];
  // 分组选择器选择结果
  @Input() groupData: string[] = [];
  // 显示规划表格或是项目表格
  @Input() isShowPlanningOrProject: boolean;
  // 设施设备列表回传事
  @Output() FacilityEquipmentListEvent = new EventEmitter<any>();
  // 设施列表
  @ViewChild('facilityListTable') facilityListTable: TableComponent;
  // 设备列表
  @ViewChild('equipmentListTable') equipmentListTable: TableComponent;
  // 国际化
  public indexLanguage: IndexLanguageInterface;
  // 设施设备列表常量
  public facilityEquipmentList = FacilityListTypeEnum;
  // 规划列表数据集
  public planningListDataSet: FacilityListModel[] = [];
  // 规划列表表格分页
  public planningListPageBean: PageModel = new PageModel(5, 1, 0);
  // 规划列表表格配置
  public planningListTableConfig: TableConfigModel;
  // 项目列表数据集
  public projectListDataSet: EquipmentListModel[] = [];
  // 项目列表分页
  public projectListPageBean: PageModel = new PageModel(5, 1, 0);
  // 项目列表表格配置
  public projectListTableConfig: TableConfigModel;
  // 批量操作按钮是否置灰
  public buttonDisabled: boolean = true;
  // 批量操作权限
  public roleDeviceOperating: boolean = false;
  // 批量操作设施下设备类型
  public deviceIsEquipmentTypes: string[];
  // 批量操作设备类型
  public equipmentTypes: string[];
  // 选择设施或设备
  public facilityOrEquipment: string = FacilityListTypeEnum.facilitiesList;
  // 更多
  private more: string;
  // 规划查询条件
  private planningQueryCondition: QueryConditionModel = new QueryConditionModel();
  // 项目查询条件
  private projectQueryCondition: QueryConditionModel = new QueryConditionModel();
  // 设施勾选数据集合
  private facilitySelectData: string[] = [];
  // 设备勾选数据集合
  private equipmentSelectData: string[] = [];

  constructor(
    public $nzI18n: NzI18nService,
    private $router: Router,
    private $indexApiService: IndexApiService,
    private $positionService: PositionService,
    private $message: FiLinkModalService,
    private $mapCoverageService: MapCoverageService,
    private $mapStoreService: MapStoreService) {
    this.indexLanguage = $nzI18n.getLocaleData(LanguageEnum.index);
  }

  public ngOnInit(): void {
    this.more = this.indexLanguage.more;
    // 获取规划列表数据
    this.initPlanningListTable();
    this.planningListTableConfig.isLoading = false;
    // 获取项目列表数据
    this.initProjectListTable();
    this.projectListTableConfig.isLoading = false;
    // 批量操作权限 （菜单操作权限和租户设置权限）
    if (SessionUtil.checkHasRole('05-1') &&
      (SessionUtil.checkHasTenantRole('1-1-6') || SessionUtil.checkHasTenantRole('1-1-7'))) {
      this.roleDeviceOperating = true;
    }
    this.getPlanningListTable();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.facilityData && changes.facilityData.currentValue.length > 0 && this.planningListTableConfig || (changes.groupData && changes.groupData.currentValue)) {
      // 筛选条件变化时默认为第一页
      this.planningQueryCondition = new QueryConditionModel();
      this.planningQueryCondition.pageCondition.pageNum = 1;
      if (this.planningListTableConfig) {
        this.getPlanningListTable();
      }
      this.initPlanningListTable();
    }
    if (changes.equipmentData && changes.equipmentData.currentValue && this.projectListTableConfig || (changes.groupData && changes.groupData.currentValue)) {
      // 筛选条件变化时默认为第一页
      this.projectQueryCondition = new QueryConditionModel();
      this.projectQueryCondition.pageCondition.pageNum = 1;
      if (this.projectListTableConfig) {
        this.getProjectListTable();

      }
      this.initProjectListTable();
    }
    // 如果区域数据变化
    if (changes.areaData && !changes.areaData.firstChange) {
      this.getPlanningListTable();
      this.getProjectListTable();
    }
  }

  /**
   * 规划表格分页
   */
  public pagePlanningList(event: PageModel): void {
    this.planningQueryCondition.pageCondition.pageNum = event.pageIndex;
    this.planningQueryCondition.pageCondition.pageSize = event.pageSize;
    this.getPlanningListTable();
  }

  /**
   * 项目表格分页
   */
  public pageProjectList(event: PageModel): void {
    this.projectQueryCondition.pageCondition.pageNum = event.pageIndex;
    this.projectQueryCondition.pageCondition.pageSize = event.pageSize;
    this.getProjectListTable();
  }

  /**
   * 跳转至更多
   */
  public goToFacilityList(): void {
    if (this.isShowPlanningOrProject === true) {
      // 跳转设施
      this.$router.navigate([`/business/facility/facility-list`], {}).then();
    } else {
      // 跳转设备
      this.$router.navigate([`/business/facility/equipment-list`], {}).then();
    }
  }

  /**
   * 是否显示筛选
   */
  public showSearch(): void {
    if (this.facilityOrEquipment === FacilityListTypeEnum.facilitiesList) {
      this.planningListTableConfig.showSearch = !this.planningListTableConfig.showSearch;
    } else {
      this.projectListTableConfig.showSearch = !this.projectListTableConfig.showSearch;
    }
  }

  /**
   * 规划表格配置
   */
  private initPlanningListTable(): void {
    if (!_.isEmpty(this.facilitySelectData)) {
      this.facilityListTable.checkAll(false);
    }
    this.planningListTableConfig = {
      isDraggable: true,
      isLoading: true,
      simplePageTotalShow: true,
      notShowPrint: true,
      showSearchSwitch: false,
      showRowSelection: false,
      showSizeChanger: true,
      showSearchExport: false,
      keepSelected: true,
      selectedIdKey: 'deviceId',
      searchReturnType: 'object',
      scroll: {x: '600px', y: '600px'},
      showPagination: true,
      simplePage: true,
      bordered: false,
      showSearch: false,
      noIndex: true,
      columnConfig: [
        {
          type: 'select',
          fixedStyle: {fixedLeft: true, style: {left: '0px'}},
          width: 50,
        },
        {// 规划名称
          title: '规划名称', key: 'planName', width: 100,
          configurable: false,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        {// 规划编号
          title: '规划编号', key: 'planCode', width: 100,
          configurable: false,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        {// 经度
          title: '经度', key: 'longitude', width: 100,
          configurable: false,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        {// 纬度
          title: '纬度', key: 'latitude', width: 100,
          configurable: false,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        {// 操作
          title: this.indexLanguage.operation, key: '', width: 80,
          searchable: true,
          searchConfig: {type: 'operate'},
          fixedStyle: {fixedRight: true, style: {right: '0px'}}
        },
      ],
      operation: [],
      sort: (event: SortCondition) => {
        // 排序
        this.planningQueryCondition.sortCondition.sortField = event.sortField;
        this.planningQueryCondition.sortCondition.sortRule = event.sortRule;
        this.getPlanningListTable();
      },
      handleSearch: (event: FilterCondition) => {
        // 筛选
        this.planningQueryCondition.filterConditions = [];
        for (const item in event) {
          if (event[item]) {
            if (['deviceType', 'deviceStatus'].includes(item) && event[item].length > 0) {
              // 设施类型、设施状态使用in查询
              this.planningQueryCondition.filterConditions.push(new FilterCondition(item, OperatorEnum.in, event[item]));
            } else if (['deviceName', 'address'].includes(item)) {
              // 设施类型、详细地址like查询
              this.planningQueryCondition.filterConditions.push(new FilterCondition(item, OperatorEnum.like, event[item]));
            }
          }
        }
        this.planningQueryCondition.pageCondition.pageNum = 1;
        this.getPlanningListTable();
      },
      handleSelect: (event: FacilityListModel[]) => {
      }
    };
  }

  /**
   * 规划表格数据加载
   */
  private getPlanningListTable(): void {
    if (this.planningData) {
      this.planningQueryCondition.filterConditions = [];
      this.planningQueryCondition.pageCondition.pageSize = PageSizeEnum.sizeFive;
      this.planningListTableConfig.isLoading = true;
      this.$indexApiService.getPlanPoleList(this.planningQueryCondition).subscribe((result: ResultModel<any>) => {
        if (result.code === ResultCodeEnum.success) {
          this.planningListPageBean.Total = result.data.totalCount;
          this.planningListPageBean.pageIndex = result.data.pageNum;
          this.planningListPageBean.pageSize = result.data.size;
          this.planningListDataSet = result.data.data;
        } else {
          this.$message.error(result.msg);
        }
        this.planningListTableConfig.isLoading = false;
      }, error => {
        this.planningListTableConfig.isLoading = false;
      });
    }
  }

  /**
   * 项目表格配置
   */
  private initProjectListTable(): void {
    if (!_.isEmpty(this.equipmentSelectData)) {
      this.equipmentListTable.checkAll(false);
    }
    this.projectListTableConfig = {
      isDraggable: true,
      isLoading: false,
      simplePageTotalShow: true,
      notShowPrint: true,
      showSearchSwitch: false,
      showRowSelection: false,
      showSizeChanger: true,
      showSearchExport: false,
      keepSelected: true,
      selectedIdKey: 'equipmentId',
      searchReturnType: 'object',
      scroll: {x: '600px', y: '600px'},
      showPagination: true,
      simplePage: true,
      bordered: false,
      showSearch: false,
      noIndex: true,
      columnConfig: [
        {
          type: 'select',
          fixedStyle: {fixedLeft: true, style: {left: '0px'}},
          width: 50,
        },
        {// 项目名称
          title: '项目名称', key: 'projectName', width: 100,
          configurable: false,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        {// 项目编号
          title: '项目编号', key: 'projectCode', width: 100,
          configurable: false,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        {// 经度
          title: '经度', key: 'longitude', width: 100,
          configurable: false,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        {// 纬度
          title: '纬度', key: 'latitude', width: 100,
          configurable: false,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        {// 操作
          title: this.indexLanguage.operation, key: '', width: 80,
          configurable: false,
          searchable: true,
          searchConfig: {type: 'operate'},
          fixedStyle: {fixedRight: true, style: {right: '0px'}}
        },
      ],
      operation: [],
      sort: (event: SortCondition) => {
        // 排序
        this.projectQueryCondition.sortCondition.sortField = event.sortField;
        this.projectQueryCondition.sortCondition.sortRule = event.sortRule;
        this.getProjectListTable();
      },
      handleSearch: (event) => {
        // 筛选
        this.projectQueryCondition.filterConditions = [];
        for (const item in event) {
          if (event[item]) {
            if (['equipmentType', 'equipmentStatus'].includes(item) && event[item].length > 0) {
              // 设备类型、设备状态使用in查询
              this.projectQueryCondition.filterConditions.push(new FilterCondition(item, OperatorEnum.in, event[item]));
            } else if (['equipmentName', 'deviceName', 'address'].includes(item)) {
              // 设备名称、所属设施、详细地址使用like查询
              this.projectQueryCondition.filterConditions.push(new FilterCondition(item, OperatorEnum.like, event[item]));
            }
          }
        }
        this.projectQueryCondition.pageCondition.pageNum = 1;
        this.getProjectListTable();
      },
      handleSelect: (event: EquipmentListModel[]) => {
      }
    };
  }

  /**
   * 项目表格数据加载
   */
  private getProjectListTable(): void {
    if (this.areaData) {
      this.projectQueryCondition.bizCondition = {
        'area': this.areaData,
        'equipment': this.equipmentData,
        'group': this.$mapStoreService.logicGroupList ? this.$mapStoreService.logicGroupList : this.groupData
      };
      this.projectQueryCondition.pageCondition.pageSize = 5;
      this.projectListTableConfig.isLoading = true;
      this.$indexApiService.queryEquipmentList(this.projectQueryCondition).subscribe((result: ResultModel<EquipmentListModel[]>) => {
        if (result.code === ResultCodeEnum.success) {
          this.projectListPageBean.Total = result.totalCount;
          this.projectListPageBean.pageIndex = result.pageNum;
          this.projectListPageBean.pageSize = result.size;
          // 枚举转换并且判断是否勾选过
          result.data.forEach(item => {
            this.equipmentSelectData.forEach(_item => {
              if (item.equipmentId === _item) {
                item.checked = true;
              }
            });
            item.cloneEquipmentType = item.equipmentType;
            item.facilityType = 'equipment';
            item.show = true;
            item.cloneEquipmentStatus = item.equipmentStatus;
            item.equipmentType = CommonUtil.codeTranslate(EquipmentTypeEnum, this.$nzI18n, item.equipmentType, LanguageEnum.facility);
            item.equipmentStatus = CommonUtil.codeTranslate(EquipmentStatusEnum, this.$nzI18n, item.equipmentStatus, LanguageEnum.facility);
          });
          this.projectListDataSet = result.data;
        } else {
          this.$message.error(result.msg);
        }
        this.projectListTableConfig.isLoading = false;
      }, error => {
        this.projectListTableConfig.isLoading = false;
      });
    }
  }

  /**
   * 根据设施id查询设备所有Id
   */
  private queryEquipmentAllId(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const body = new EquipmentListResultModel(this.facilitySelectData);
      this.$indexApiService.queryEquipmentListByDeviceId(body).subscribe((result: ResultModel<EquipmentModel[]>) => {
        const list = result.data.map(item => {
          return item.equipmentId;
        });
        this.deviceIsEquipmentTypes = result.data.map(item => {
          return item.equipmentType;
        });
        resolve(list);
      });
    });
  }
}
