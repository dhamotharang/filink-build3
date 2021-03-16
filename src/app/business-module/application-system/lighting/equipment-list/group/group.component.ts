import {Component, OnInit, Input, Output, EventEmitter, AfterViewInit, OnDestroy} from '@angular/core';
import {PageModel} from '../../../../../shared-module/model/page.model';
import {ColumnConfig, TableConfigModel} from '../../../../../shared-module/model/table-config.model';
import {FilterCondition, QueryConditionModel, SortCondition} from '../../../../../shared-module/model/query-condition.model';
import {OnlineLanguageInterface} from '../../../../../../assets/i18n/online/online-language.interface';
import {NzI18nService} from 'ng-zorro-antd';
import {ApplicationService} from '../../../share/service/application.service';
import {ResultModel} from '../../../../../shared-module/model/result.model';
import {ResultCodeEnum} from '../../../../../shared-module/enum/result-code.enum';
import {ApplicationFinalConst, RouterJumpConst, SwitchActionConst} from '../../../share/const/application-system.const';
import {FiLinkModalService} from '../../../../../shared-module/service/filink-modal/filink-modal.service';
import {ApplicationInterface} from '../../../../../../assets/i18n/appliction/application.interface';
import {SliderValueConst} from '../../../share/const/slider.const';
import {LanguageEnum} from '../../../../../shared-module/enum/language.enum';
import {GroupListModel} from '../../../share/model/equipment.model';
import {DistributeModel} from '../../../share/model/distribute.model';
import {Router} from '@angular/router';
import {TableColumnConfig} from '../../../share/config/table-column.config';
import {PolicyEnum} from '../../../share/enum/policy.enum';
import {OperatorEnum} from '../../../../../shared-module/enum/operator.enum';
import {FilterValueConst} from '../../../share/const/filter.const';
import {LightGroupTableEnum, ReleaseGroupTableEnum} from '../../../share/enum/auth.code.enum';
import {ControlInstructEnum} from '../../../../../core-module/enum/instruct/control-instruct.enum';
import {SelectTableEquipmentChangeService} from '../../../share/service/select-table-equipment-change.service';
import {SelectFacilityChangeService} from '../../../share/service/select-facility-change.service';
import {FacilityForCommonService} from '../../../../../core-module/api-service/facility';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

/**
 * 设备列表-分组列表页面
 */
@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss']
})
export class GroupComponent implements OnInit, OnDestroy {
  // 区分照明，信息屏，安防
  @Input() groupType: string = '';
  // 配置表格配置项
  @Input() tableColumn: TableConfigModel;
  // 勾选分组数据改变
  @Output() selectDataChange = new EventEmitter();
  // 存储分组数据集合
  public dataSet: GroupListModel[] = [];
  // 分页参数
  public pageBean: PageModel = new PageModel();
  // 表格配置
  public tableConfig: TableConfigModel;
  // 批量亮度集合
  public dimmingLight: GroupListModel[] = [];
  // 滑块值的常量
  public sliderValue = SliderValueConst;
  // 表格多语言
  public language: OnlineLanguageInterface;
  // 设备列表多语言
  public languageTable: ApplicationInterface;
  // 控制亮度显隐
  public isBrightness: boolean = false;
  // 亮度值
  public dimmingLightValue: number = 0;
  // 分组表格配置
  public groupColumnConfig: ColumnConfig[] = [];
  // 关闭订阅流
  public destroy$ = new Subject<void>();
  // 表格初始化条件
  private queryCondition: QueryConditionModel = new QueryConditionModel();

  constructor(
    // 多语言配置
    private $nzI18n: NzI18nService,
    // 路由
    private $router: Router,
    // 提示
    private $message: FiLinkModalService,
    // 接口服务
    private $applicationService: ApplicationService,
    private $selectTableEquipmentChangeService: SelectTableEquipmentChangeService,
    private $selectFacilityChangeService: SelectFacilityChangeService,
    private $facilityForCommonService: FacilityForCommonService,
  ) {
    // 多语言
    this.language = this.$nzI18n.getLocaleData(LanguageEnum.online);
    this.languageTable = this.$nzI18n.getLocaleData(LanguageEnum.application);
  }

  /**
   *初始化
   */
  public ngOnInit(): void {
    if (!this.tableColumn) {
      this.initTableConfig();
    } else {
      this.tableConfig = this.tableColumn;
    }
    // 监听地图选中设备变化
    this.$selectFacilityChangeService.eventEmit.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      if (value.equipmentIds && value.equipmentIds.length) {
        // 联动列表筛选条件改变
        this.queryCondition.filterConditions = [new FilterCondition('equipmentIds', OperatorEnum.in, value.equipmentIds)];
      } else {
        this.queryCondition.filterConditions = [];
      }
      this.refreshData();
    });
    this.refreshData();
  }

  ngOnDestroy(): void {
    // 取消订阅
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * 分页查询
   * @ param event
   */
  public pageChange(event: PageModel): void {
    this.queryCondition.pageCondition.pageNum = event.pageIndex;
    this.queryCondition.pageCondition.pageSize = event.pageSize;
    this.refreshData();
  }

  /**
   * 取消操作
   */
  public handleCancel(): void {
    this.isBrightness = false;
    // 重置为初始
    this.dimmingLightValue = 0;
  }

  /**
   * 亮度调整
   */
  public handleOk(): void {
    const params = {
      groupIds: this.dimmingLight.map(item => item.groupId),
      commandId: ControlInstructEnum.setBrightness,
      param: {
        lightnessNum: this.dimmingLightValue
      }
    };
    this.isBrightness = false;
    this.groupControl(params);
  }


  /**
   * 列的配置项
   */
  public handleColumn(): void {
    this.groupColumnConfig = TableColumnConfig.groupColumnConfig(this.language, this.languageTable, true);
    this.groupColumnConfig.unshift({type: 'select', fixedStyle: {fixedLeft: true, style: {left: '0px'}}, width: 62});
  }

  /**
   * 分组指令
   * @ param params
   */
  public groupControl(params: DistributeModel): void {
    this.$applicationService.groupControl(params).subscribe((res: ResultModel<string>) => {
      this.checkEquipmentMode(params.groupIds).then(resolve => {
        if (res.code === ResultCodeEnum.success) {
          if (resolve.code === ResultCodeEnum.success) {
            // 弹出指令下发成功提示
            this.$message.success(`${this.languageTable.contentList.distribution}!`);
          } else {
            // 指令异常弹出指令模式提示，不影响指令下发结果
            this.$message.error(resolve.msg);
          }
          this.isBrightness = false;
          this.dimmingLightValue = 0;
          this.refreshData();
        } else {
          // 弹出指令下发错误结果提示
          this.$message.error(res.msg);
        }
      });
    });
  }

  /**
   * 设备开关
   * @ param data 选中的数据
   * @ param type 区分开和关
   */
  public switchLight(data: GroupListModel[], type: string): void {
    const params = {
      groupIds: data.map(item => item.groupId),
      commandId: type === SwitchActionConst.open ? ControlInstructEnum.turnOn : ControlInstructEnum.turnOff,
      param: {}
    };
    this.groupControl(params);
  }

  /**
   * 设备详情
   */
  public handEquipmentOperation(data: GroupListModel): void {
    let path;
    if (this.groupType === ApplicationFinalConst.release) {
      path = RouterJumpConst.releaseGroupDetails;
    } else {
      path = RouterJumpConst.groupDetails;
    }
    this.$router.navigate([path], {
      queryParams: {
        groupId: data.groupId,
        groupName: data.groupName,
        remark: data.remark
      }
    }).then();
  }

  /**
   * 改变滑块值
   * @ param event
   */
  public handleSlider(event: number): void {
    this.dimmingLightValue = event;
  }

  /**
   * 初始化表格配置
   */
  private initTableConfig(): void {
    const url = this.$router.url;
    let primaryKey;
    if (url.includes(ApplicationFinalConst.lighting)) {
      primaryKey = LightGroupTableEnum;
    } else {
      primaryKey = ReleaseGroupTableEnum;
    }
    this.handleColumn();
    this.tableConfig = {
      outHeight: 108,
      isDraggable: true,
      primaryKey: primaryKey.primaryKey,
      isLoading: true,
      showSearchSwitch: true,
      showSizeChanger: true,
      scroll: {x: '1600px', y: '600px'},
      noIndex: true,
      showSearchExport: false,
      notShowPrint: true,
      columnConfig: this.groupColumnConfig,
      showPagination: true,
      bordered: false,
      showSearch: false,
      topButtons: [
        // 开
        {
          text: this.languageTable.equipmentTable.switch,
          needConfirm: true,
          canDisabled: true,
          permissionCode: primaryKey.primaryOpenKey,
          btnType: 'special',
          iconClassName: 'fiLink-open',
          confirmContent: `${this.languageTable.equipmentTable.confirmOpen}?`,
          handle: (data: GroupListModel[]) => {
            this.switchLight(data, SwitchActionConst.open);
          }
        },
        // 关
        {
          text: this.languageTable.equipmentTable.shut,
          needConfirm: true,
          canDisabled: true,
          permissionCode: primaryKey.primaryShutKey,
          btnType: 'special',
          iconClassName: 'fiLink-shut-off',
          confirmContent: `${this.languageTable.equipmentTable.confirmClose}?`,
          handle: (data: GroupListModel[]) => {
            this.switchLight(data, SwitchActionConst.close);
          }
        },
      ],
      moreButtons: [
        // 上电
        {
          text: this.languageTable.equipmentTable.upElectric,
          iconClassName: 'fiLink-up-electric disabled-icon',
          canDisabled: true,
          disabled: true,
          permissionCode: primaryKey.primaryUpKey,
          handle: () => {
          }
        },
        // 下电
        {
          text: this.languageTable.equipmentTable.downElectric,
          iconClassName: 'fiLink-down-electric disabled-icon',
          canDisabled: true,
          disabled: true,
          permissionCode: primaryKey.primaryDownKey,
          handle: () => {
          }
        },
        // 更多操作
        {
          text: this.languageTable.equipmentTable.light,
          canDisabled: true,
          permissionCode: primaryKey.primaryLightKey,
          iconClassName: 'fiLink-light',
          handle: (data: GroupListModel[]) => {
            this.dimmingLight = data;
            this.isBrightness = true;
          }
        },
      ],
      operation: [
        // 详情
        {
          text: this.languageTable.equipmentTable.details,
          className: 'fiLink-view-detail',
          permissionCode: primaryKey.primaryDetailKey,
          handle: (data: GroupListModel) => {
            this.handEquipmentOperation(data);
          },
        },
        // 上电
        {
          text: this.languageTable.equipmentTable.upElectric,
          className: 'fiLink-up-electric disabled-icon',
          permissionCode: primaryKey.primaryUpKey,
          handle: () => {
          },
        },
        // 下电
        {
          text: this.languageTable.equipmentTable.downElectric,
          className: 'fiLink-down-electric disabled-icon',
          permissionCode: primaryKey.primaryDownKey,
          handle: () => {
          },
        },
        // 开
        {
          text: this.languageTable.equipmentTable.switch,
          className: 'fiLink-open',
          needConfirm: true,
          permissionCode: primaryKey.primaryOpenKey,
          confirmContent: `${this.languageTable.equipmentTable.confirmOpen}?`,
          handle: (currentIndex: GroupListModel) => {
            this.switchLight([currentIndex], SwitchActionConst.open);
          }
        },
        // 关
        {
          text: this.languageTable.equipmentTable.shut,
          className: 'fiLink-shut-off',
          needConfirm: true,
          permissionCode: primaryKey.primaryShutKey,
          confirmContent: `${this.languageTable.equipmentTable.confirmClose}?`,
          handle: (currentIndex: GroupListModel) => {
            this.switchLight([currentIndex], SwitchActionConst.close);
          }
        },
        // 亮度
        {
          text: this.languageTable.equipmentTable.light,
          className: 'fiLink-light',
          permissionCode: primaryKey.primaryLightKey,
          handle: (data: GroupListModel) => {
            this.dimmingLight = [data];
            this.queryEquipmentInfo(data);
          },
        }
      ],
      // 排序
      sort: (event: SortCondition) => {
        this.queryCondition.sortCondition.sortField = event.sortField;
        this.queryCondition.sortCondition.sortRule = event.sortRule;
        this.refreshData();
      },
      // 搜索
      handleSearch: (event: FilterCondition[]) => {
        this.queryCondition.pageCondition.pageNum = 1;
        this.queryCondition.filterConditions = event;
        this.refreshData();
      },
      // 勾选
      handleSelect: (event) => {
        this.getPositionMapByGroupIds(event);
      }
    };
  }

  /**
   * 分组列表勾选分组联动地图
   */
  public getPositionMapByGroupIds(event): void {
    this.selectDataChange.emit(event);
    // 表格勾选数据
    const groupIds = [];
    if (event.length > 0) {
      event.forEach(item => {
        groupIds.push(item.groupId);
      });
    }
    // 发射表格勾选数据变化
    this.$selectTableEquipmentChangeService.eventEmit.emit({type: 'groupId', groupIds: groupIds});
  }


  /**
   * 默认查询条件
   */
  private defaultQuery() {
    const url = this.$router.url;
    const equipmentFlag = this.queryCondition.filterConditions.some(item => item.filterField === PolicyEnum.equipmentType);
    if (url.includes(ApplicationFinalConst.lighting)) {
      if (!equipmentFlag) {
        const equipmentTypes = new FilterCondition(PolicyEnum.equipmentType, OperatorEnum.in, FilterValueConst.lightingFilter);
        this.queryCondition.filterConditions.push(equipmentTypes);
      }
    } else {
      if (!equipmentFlag) {
        const equipmentTypes = new FilterCondition(PolicyEnum.equipmentType, OperatorEnum.in, FilterValueConst.informationFilter);
        this.queryCondition.filterConditions.push(equipmentTypes);
      }
    }
  }

  /**
   * 刷新表格数据
   */
  private refreshData(): void {
    this.tableConfig.isLoading = true;
    this.defaultQuery();
    this.$applicationService.queryEquipmentGroupInfoList(this.queryCondition)
      .subscribe((res: ResultModel<GroupListModel[]>) => {
        if (res.code === ResultCodeEnum.success) {
          this.tableConfig.isLoading = false;
          const {data, totalCount, pageNum, size} = res;
          this.dataSet = data;
          this.pageBean.Total = totalCount;
          this.pageBean.pageIndex = pageNum;
          this.pageBean.pageSize = size;
        } else {
          this.$message.error(res.msg);
        }
      }, () => {
        this.tableConfig.isLoading = false;
      });
  }

  /**
   * 查询分组信息
   * 单个设备调整亮度时需要回显亮度
   */
  private queryEquipmentInfo(data: GroupListModel): void {
    const queryBody = {
      groupIds: [data.groupId]
    };
    this.$applicationService.queryLightNumberByGroupId(queryBody)
      .subscribe((res: ResultModel<any>) => {
        if (res.code === ResultCodeEnum.success) {
          // 单个设备调整亮度时需要回显亮度
          this.dimmingLightValue = res.data[0].groupLight;
          this.isBrightness = true;
        } else {
          this.$message.error(res.msg);
        }
      });
  }

  /**
   * 查询是手动控制还是自动
   */
  private checkEquipmentMode(data): Promise<ResultModel<any>> {
    return new Promise((resolve, reject) => {
      this.$facilityForCommonService.checkEquipmentMode({groupEquipmentIdList: data}).subscribe((res: ResultModel<any>) => {
        resolve(res);
      });
    });
  }
}
