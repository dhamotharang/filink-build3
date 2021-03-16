import {AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {BMapPlusService} from '../../../../../shared-module/service/map-service/b-map/b-map-plus.service';
import {GMapPlusService} from '../../../../../shared-module/service/map-service/g-map/g-map-plus.service';
import {MapServiceUtil} from '../../../../../shared-module/service/map-service/map-service.util';
import {FilinkMapEnum} from '../../../../../shared-module/enum/filinkMap.enum';
import {BMapDrawingService} from '../../../../../shared-module/service/map-service/b-map/b-map-drawing.service';
import {GMapDrawingService} from '../../../../../shared-module/service/map-service/g-map/g-map-drawing.service';
import {takeUntil} from 'rxjs/operators';
import {BMAP_ARROW, BMAP_DRAWING_RECTANGLE} from '../../../../../shared-module/component/map-selector/map.config';
import {Subject} from 'rxjs';
import {LanguageEnum} from '../../../../../shared-module/enum/language.enum';
import {PlanProjectLanguageInterface} from '../../../../../../assets/i18n/plan-project/plan-project.language.interface';
import {NzI18nService} from 'ng-zorro-antd';
import {PageModel} from '../../../../../shared-module/model/page.model';
import {TableConfigModel} from '../../../../../shared-module/model/table-config.model';
import {CommonLanguageInterface} from '../../../../../../assets/i18n/common/common.language.interface';
import {PlanningListTableUtil} from '../../../share/util/planning-list-table.util';
import {FilterCondition, QueryConditionModel} from '../../../../../shared-module/model/query-condition.model';
import {ProductLanguageInterface} from '../../../../../../assets/i18n/product/product.language.interface';
import {ResultModel} from '../../../../../shared-module/model/result.model';
import {PlanInfoModel} from '../../../share/model/plan-info.model';
import {PlanApiService} from '../../../share/service/plan-api.service';
import * as _ from 'lodash';
import {ResultCodeEnum} from '../../../../../shared-module/enum/result-code.enum';
import {PlanPointRender} from '../../../plan-manage/plan-point-detail/plan-point-render';
import {ActivatedRoute, Router} from '@angular/router';
import {MapConfig as BMapConfig} from '../../../../../shared-module/component/map/b-map.config';
import {FiLinkModalService} from '../../../../../shared-module/service/filink-modal/filink-modal.service';
import {IndexLanguageInterface} from '../../../../../../assets/i18n/index/index.language.interface';
import {PlanPointModel} from '../../../share/model/plan-point.model';
import {CommonUtil} from '../../../../../shared-module/util/common-util';
import {bigIconSize, defaultIconSize} from '../../../../../shared-module/service/map-service/map.config';
import {PlanProjectApiService} from '../../../share/service/plan-project.service';
import {OperateTypeEnum} from '../../../../../shared-module/enum/page-operate-type.enum';
import {PointStatusEnum} from '../../../share/enum/point-status.enum';
import {PointStatusIconEnum} from '../../../share/enum/point-status-icon.enum';
import {WisdomPointInfoModel} from '../../../share/model/wisdom-point-info.model';
import {SelectPointTypeEnum} from '../../../share/enum/select-point-type.enum';

/**
 * 项目管理-编辑项目-规划点位
 */
@Component({
  selector: 'app-planning-point',
  templateUrl: './planning-point.component.html',
  styleUrls: ['./planning-point.component.scss']
})
export class PlanningPointComponent extends PlanPointRender implements OnInit, AfterViewInit, OnDestroy {
  // 智慧杆状态
  @ViewChild('pointStatusTemp') pointStatusTemp: TemplateRef<HTMLDocument>;
  // 智慧杆状态枚举
  public pointStatusEnum = PointStatusEnum;
  // 国际化枚举
  public languageEnum = LanguageEnum;
  // 判断当前页新增还是修改
  private pageType: OperateTypeEnum = OperateTypeEnum.add;
  // 地图绘画工具
  public mapDrawUtil: any;
  // 绘制类型
  public drawType: string = BMAP_ARROW;
  // 覆盖物集合
  public overlays = [];
  // 地图类型
  public mapType: string = FilinkMapEnum.baiDu;
  // 关闭订阅流
  public destroy$ = new Subject<void>();
  // 项目规划语言包
  public language: PlanProjectLanguageInterface;
  // 产品管理国际化词条
  public productLanguage: ProductLanguageInterface;
  // 公共国际化
  public commonLanguage: CommonLanguageInterface;
  // 首页国际化
  public indexLanguage: IndexLanguageInterface;
  // 框选开启
  public drawUtilOpen: boolean = false;
  // 开启框选后操作目的
  public selectPointType: SelectPointTypeEnum;
  // 框选点位类型枚举
  public selectPointTypeEnum = SelectPointTypeEnum;
  // 点位状态面板显示隐藏
  public pointStatusPanelShow: boolean = false;
  public checkPointStatus = [];

  // 规划列表弹窗是否显示
  public isShowPlanList: boolean = false;
  // 规划列表弹窗表格数据源
  public planListDataSet: PlanInfoModel[] = [];
  // 规划列表弹窗翻页
  public planListPageBean: PageModel = new PageModel();
  // 规划列表弹窗表格配置
  public tablePlanListConfig: TableConfigModel;
  // 查询参数对象集
  public planListQueryCondition: QueryConditionModel = new QueryConditionModel();

  // 已选规划列表
  public selectPlanList: PlanInfoModel[] = [];
  // 是否显示型号预设值和已选智慧杆浮窗
  public isShowSelect: boolean = false;
  // 型号预设施表格数据源
  public modelPresetDataSet = [];
  // 型号预设施表格配置
  public modelPresetTableConfig: TableConfigModel;
  // 型号预设置翻页
  public modelPresetPageBean: PageModel = new PageModel();

  // 已选智慧杆列表数据源
  public selectWisdomDataSet: WisdomPointInfoModel[] = [];
  // 已选智慧杆列表表格配置
  public selectWisdomTableConfig: TableConfigModel;
  // 已选智慧杆列表翻页
  public selectWisdomPageBean: PageModel = new PageModel();
  // 缓存地图应渲染的点位数据
  public pointDataInMap: WisdomPointInfoModel[] = [];

  // 已经存在于该项目的需高亮的点位数据，用于编辑回显用
  public existingWisdomData: WisdomPointInfoModel[] = [];

  // 是否展示产品列表弹窗
  public isShowProductList: boolean = false;
  // 当前操作选择型号的规划数据
  public currentPlanData = {
    planId: null,
    productId: null,
    productModel: null
  };
  // 地图本次框选到的数据
  public selectedAllPoint: any[] = [];

  // 当前项目id
  public projectId: string;
  // 地图服务类
  public mapService: BMapPlusService | GMapPlusService;

  constructor(
    private $router: Router,
    public $planApiService: PlanApiService,
    public $planProjectApiService: PlanProjectApiService,
    public $message: FiLinkModalService,
    private $nzI18n: NzI18nService,
    private $active: ActivatedRoute,
  ) {
    super($planApiService);
  }


  /**
   * 缩放防抖 重写
   */
  zoomEnd = _.debounce(() => {
    console.log(1111);
    if (this.isCreating) {
      return;
    }
    if (!this.mapService) {
      return;
    }
    // 清除设施或设备以外所有的点
    this.clearAllMarkerPoint();
    // 缩放层级区级
    if (this.mapService.getZoom() <= BMapConfig.areaZoom) {
    }
    // 缩放层级街道级别
    if (this.mapService.getZoom() > BMapConfig.areaZoom) {
      if (!_.isEmpty(this.modelPresetDataSet)) {
        this.selectPointByPlanIdAndNoProject().then();
      }
      if (this.pointDataInMap) {
        // 渲染点位
        this.renderPlanPoint(this.pointDataInMap);
        if (!_.isEmpty(this.selectWisdomDataSet)) {
          this.highLightDevice(this.selectWisdomDataSet);
        }
      }
      // // 渲染点位
      // this.renderPlanPoint(this.pointDataInMap);
      // // 高亮已选点位
      // this.highLightDevice(this.selectWisdomDataSet);
    }
  }, 100, {leading: false, trailing: true});

  /**
   * 平移拖动
   */
  dragEnd = _.debounce(() => {
    if (this.mapService.getZoom() > BMapConfig.areaZoom) {
      if (!_.isEmpty(this.modelPresetDataSet.filter(item => item.productId))) {
        this.selectPointByPlanIdAndNoProject().then(() => {
          this.highLightDevice(this.selectWisdomDataSet);
        });
      }
    }
  }, 100, {leading: false, trailing: true});

  public ngOnInit(): void {
    this.language = this.$nzI18n.getLocaleData(LanguageEnum.planProject);
    this.productLanguage = this.$nzI18n.getLocaleData(LanguageEnum.product);
    this.indexLanguage = this.$nzI18n.getLocaleData(LanguageEnum.index);
    this.commonLanguage = this.$nzI18n.getLocaleData(LanguageEnum.common);
    // 获取点位状态checkbook配置
    this.getCheckPointStatus();
    this.$active.queryParams.pipe(takeUntil(this.destroy$)).subscribe(param => {
      if (param.id) {
        this.projectId = param.id;
      }
      this.pageType = param.type === OperateTypeEnum.add ? OperateTypeEnum.add : OperateTypeEnum.update;
    });
    if (!this.mapService) {
      this.initMap();
    }
    // 添加地图事件
    this.addMapEvent();
    // 初始化型号预设置列表表格配置
    this.initModelPresetTable();
    // 初始化已选智慧杆列表表格配置
    this.initSelectWisdomTable();
    if (this.pageType === OperateTypeEnum.update) {
      // 查询项目点位信息
      this.queryPointInfoByProjectId();
    }
  }

  ngAfterViewInit(): void {
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  /**
   * 获取可选点位状态配置
   */
  public getCheckPointStatus(): void {
    const arr = CommonUtil.codeTranslate(PointStatusEnum, this.$nzI18n, null, LanguageEnum.planProject) as any[];
    arr.forEach(item => {
      item.value = item.code;
      item.checked = true;
    });
    this.checkPointStatus = arr;
  }

  checkPointStatusChange($event) {

  }

  /**
   * 查询项目点位信息
   */
  public queryPointInfoByProjectId() {
    this.$planProjectApiService.queryPointInfoByProjectId(this.projectId).subscribe((result) => {
      if (result.code === ResultCodeEnum.success && result.data) {
        // 回显已选智慧杆点位
        this.isShowSelect = true;
        if (result.data.positionCenterLatitude) {
          const lat = result.data.positionCenterLatitude;
          const lng = result.data.positionCenterLongitude;
          // @ts-ignore
          this.mapService.setCenterAndZoom(lng, lat, BMapConfig.deviceZoom);
        } else {
          // 定位到当前城市
          this.mapService.locateToUserCity();
        }
        if (!_.isEmpty(result.data.pointInfoList)) {
          this.selectWisdomDataSet = _.cloneDeep(result.data.pointInfoList);
          this.selectWisdomDataSet.forEach(item => {
            item.statusIconClass = PointStatusIconEnum[item.pointStatus];
          });
          // 缓存项目已有的规划点位
          this.existingWisdomData = _.cloneDeep(result.data.pointInfoList);
          // 处理成渲染地图点需要的结构
          result.data.pointInfoList.forEach(item => {
            item['facilityId'] = item.pointId;
            item['lng'] = parseFloat(item.xposition);
            item['lat'] = parseFloat(item.yposition);
            item['cloneCode'] = item.planId;
            item['code'] = null;
            item['show'] = true;
            item['deviceType'] = 'D002';
          });
          this.pointDataInMap = _.cloneDeep(result.data.pointInfoList);
          // 缓存项目已有的规划点位
          this.existingWisdomData = _.cloneDeep(result.data.pointInfoList);
        }
      } else {
        this.mapService.locateToUserCity();
      }
    });
  }

  /**
   * 打开规划列表弹窗
   */
  public OpenPlanListWindow() {
    this.isShowPlanList = true;
    // 初始化规划列表
    this.initPlanListTable();
    this.refreshPlanList();
  }

  /**
   * 规划列表弹窗翻页操作
   */
  public planListPageChange(e: PageModel) {

  }

  /**
   * 规划列表弹窗确定
   */
  public handlePlanOk() {
    this.isShowPlanList = false;
    this.modelPresetDataSet = _.cloneDeep(this.selectPlanList);
    this.isShowSelect = true;
  }

  /**
   * 规划列表弹窗取消
   */
  public handlePlanCancel() {
    this.isShowPlanList = false;
  }

  /**
   * 选中产品变化
   * @param event 产品数据
   */
  public selectProductChange(event) {
    this.isShowProductList = false;
    if (event.length === 1) {
      this.currentPlanData.productId = event[0].productId;
      this.currentPlanData.productModel = event[0].productModel;
      this.modelPresetDataSet.forEach(item => {
        if (item.planId === this.currentPlanData.planId) {
          item.productId = this.currentPlanData.productId;
          item.productModel = this.currentPlanData.productModel;
          item.supplierName = event[0].supplierName;
        }
      });
      this.selectPointByPlanIdAndNoProject().then((resolve: PlanPointModel) => {
        if (resolve.point) {
          const lng = parseFloat(resolve.point.xposition);
          const lat = parseFloat(resolve.point.yposition);
          // @ts-ignore
          this.mapService.setCenterAndZoom(lng, lat, BMapConfig.deviceZoom);
        }
      });

    }
  }

  /**
   * 型号预设置翻页操作
   * @param e 翻页数据
   */
  public modelPresetPageChange(e) {

  }


  /**
   * 打开框选工具
   * @param type 框选类型
   */
  public openDrawUtil(type) {
    this.drawUtilOpen = true;
    if (this.drawUtilOpen === true) {
      // 框选工具开启
      this.mapDrawUtil.open();
      this.mapDrawUtil.setDrawingMode(BMAP_DRAWING_RECTANGLE);
    }
    this.selectPointType = type;
  }

  /**
   * 保存规划点位信息操作
   */
  public onSavePointInfo(): void {
    const pointList = [];
    if (!_.isEmpty(this.selectWisdomDataSet)) {
      this.selectWisdomDataSet.forEach(item => {
        pointList.push({
          pointId: item.pointId,
          areaCode: item.areaCode,
          areaName: item.areaName,
          position: `${item.xposition},${item.yposition}`,
          productId: item.productId
        });
      });
    }
    const data = {
      projectId: this.projectId,
      pointInfoList: pointList
    };
    let requestUrl;
    if (this.pageType === OperateTypeEnum.add) {
      requestUrl = this.$planProjectApiService.addProjectPoint(data);
    } else {
      requestUrl = this.$planProjectApiService.updateProjectPoint(data);
    }
    requestUrl.subscribe((result: ResultModel<any>) => {
      if (result.code === ResultCodeEnum.success) {
        this.$message.success(`创建项目点位成功`);
        // 跳转至项目列表
        this.$router.navigate([`business/plan-project/project-list`]).then();
      } else {
        this.$message.error(result.msg);
      }
    });
  }

  /**
   * 取消规划点位操作
   */
  public handleCancelPointInfo(): void {
    // 跳转至项目列表
    this.$router.navigate([`business/plan-project/project-list`]).then();
  }

  /**s
   * 初始化地图
   */
  private initMap(): void {
    this.mapService = MapServiceUtil.getPlusMap();
    this.mapService.createPlusMap('planningPointMap');
    // 地图搜索
    this.mapService.addLocationSearchControl('_suggestId', '_searchResultPanel');
    if (this.mapType === FilinkMapEnum.baiDu) {
      // 实例化鼠标绘制工具
      this.mapDrawUtil = new BMapDrawingService(this.mapService.mapInstance);
    } else if (this.mapType === FilinkMapEnum.google) {
      // 实例化鼠标绘制工具
      this.mapDrawUtil = new GMapDrawingService(this.mapService.mapInstance);
    }
    this.addEventListener();
  }

  /**
   *添加监听并获取数据
   */
  public addEventListener() {
    this.mapDrawUtil.addEventListener('overlaycomplete', (e) => {
      // 绘制完成之后先关闭绘制模式
      this.drawType = BMAP_ARROW;
      this.mapDrawUtil.close();
      this.mapDrawUtil.setDrawingMode(null);
      // 获取框选内的点
      this.selectedAllPoint = this.currentWindowPointData.filter(item => e.overlay.containPoint(item.point)).map(item => item.$detail);
      // 绘制完成删除框线
      this.mapService.removeOverlay(e.overlay);
      // 没有框到
      if (!(this.selectedAllPoint && this.selectedAllPoint.length)) {
        this.$message.error(this.language.notSelectedMsg);
        return;
      }
      if (this.selectPointType === SelectPointTypeEnum.add) {
        // 框选添加智慧杆
        this.selectWisdomDataSet.push(...this.selectedAllPoint);
        this.selectWisdomDataSet = this.selectWisdomDataSet.slice();
        this.selectWisdomDataSet = _.uniqWith(this.selectWisdomDataSet, _.isEqual);
        this.highLightDevice(this.selectWisdomDataSet);
      } else if (this.selectPointType === SelectPointTypeEnum.change) {
        // 框选修改框选的智慧杆型号
      }
    });

  }

  /**
   * 批量高亮设施
   * @param data 高亮的数据
   */
  public highLightDevice(data) {
    data.forEach(item => {
      this.selectDeviceById(item.pointId);
    });
  }

  /**
   * 选中设施
   * @param id 区分地图标记点的id
   */
  public selectDeviceById(id) {
    // 拿到标记点
    const marker = this.mapService.getMarkerById(id);
    const data = this.mapService.getMarkerDataById(id);
    // 获取设施图标
    const imgUrl = CommonUtil.getFacilityIconUrl(bigIconSize, data.deviceType);
    // 切换大图标
    let _icon;
    if (!(this.mapService instanceof GMapPlusService)) {
      _icon = this.mapService.toggleBigIcon(imgUrl);
    }
    marker.setIcon(_icon);
  }

  /**
   * 根据标记点id清除高亮选中样式
   * @param ids 清除高亮的点位id集合
   *
   */
  private clearSelectStyleById(ids) {
    ids.forEach(item => {
      // 拿到标记点
      const marker = this.mapService.getMarkerById(item);
      const data = this.mapService.getMarkerDataById(item);
      // 获取智慧杆未高亮选中图标
      const imgUrl = CommonUtil.getFacilityPointIconUrl(defaultIconSize, data.deviceType, data.pointStatus);
      const icon = this.mapService.toggleIcon(imgUrl);
      marker.setIcon(icon);
    });
  }

  /**
   * 规划列表弹窗列表配置初始化
   */
  private initPlanListTable() {
    this.tablePlanListConfig = {
      isDraggable: true,
      isLoading: true,
      primaryKey: 'planList',
      outHeight: 108,
      notShowPrint: true,
      showSizeChanger: false,
      showSearchSwitch: true,
      showPagination: true,
      scroll: {x: '1804px', y: '340px'},
      noIndex: true,
      selectedIdKey: 'planId',
      columnConfig: PlanningListTableUtil.getColumnConfig(this, this.$nzI18n),
      handleSearch: (event: FilterCondition[]) => {
      },
      handleSelect: (e) => {
        this.selectPlanList = e;
      }
    };
  }

  /**
   * 刷新规划列表
   */
  private refreshPlanList(): void {
    this.tablePlanListConfig.isLoading = true;
    this.$planApiService.selectPlanList(this.planListQueryCondition).subscribe((result: ResultModel<PlanInfoModel[]>) => {
      this.tablePlanListConfig.isLoading = false;
      this.planListDataSet = result.data || [];
      this.planListPageBean.pageIndex = result.pageNum;
      this.planListPageBean.Total = result.totalCount;
      this.planListPageBean.pageSize = result.size;
    });
  }

  /**
   * 初始化型号预设置表格配置
   */
  private initModelPresetTable(): void {
    this.modelPresetTableConfig = {
      isDraggable: true,
      isLoading: false,
      outHeight: 108,
      notShowPrint: true,
      showSizeChanger: false,
      showSearchSwitch: true,
      showPagination: true,
      scroll: {x: '510px', y: '340px'},
      columnConfig: [
        { // 选择
          type: 'select',
          fixedStyle: {fixedLeft: true, style: {left: '0px'}},
          width: 62
        },
        // { // 序号
        //   type: 'serial-number',
        //   width: 62,
        //   title: this.commonLanguage.serialNumber,
        //   fixedStyle: {fixedLeft: true, style: {left: '62px'}}
        // },
        { // 规划名称
          title: this.language.planName, key: 'planName', width: 150,
          isShowSort: true,
          searchable: true,
          // configurable: false,
          searchConfig: {type: 'input'}
        },
        { // 默认型号
          title: this.language.defaultModel,
          key: 'productModel', width: 150,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'},
        },
        { // 供应商
          title: this.productLanguage.supplier,
          key: 'supplierName', width: 150,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // 操作列
          title: this.commonLanguage.operate,
          searchable: true,
          searchConfig: {type: 'operate'},
          key: '', width: 100,
          fixedStyle: {fixedRight: true, style: {right: '0px'}}
        }
      ],
      rightTopButtons: [
        {
          // 清空已选规划按钮
          text: this.language.clearPlan,
          iconClassName: 'fiLink-clear-all-icon',
          needConfirm: true,
          confirmTitle: '清空操作警告，是否确认操作？',
          confirmContent: '清空同时会删除地图上的点位，是否确认清空？',
          handle: () => {
            this.modelPresetDataSet = [];
          }
        },
        {
          // 批量删除规划
          text: this.language.batchDelete,
          iconClassName: 'fiLink-delete',
          needConfirm: true,
          confirmTitle: '删除操作警告，是否确认操作？',
          confirmContent: '删除该规划同时会删除地图上的点位，是否确认删除？',
          handle: () => {
          }
        }
      ],
      operation: [
        // 设置型号
        {
          text: this.language.setModel,
          className: 'fiLink-flink_shezhixinghao-icon',
          handle: (e) => {
            this.currentPlanData.planId = e.planId;
            this.currentPlanData.productId = e.productId;
            this.isShowProductList = true;
          }
        },
        // 删除
        {
          text: this.commonLanguage.deleteBtn,
          className: 'fiLink-delete red-icon',
          needConfirm: true,
          confirmTitle: '删除操作警告，是否确认操作？',
          confirmContent: '删除该规划同时会删除地图上的点位，是否确认删除？',
          handle: (e) => {
            this.modelPresetDataSet = this.modelPresetDataSet.filter(item => item.planId !== e.planId);
            // 地图上删除该规划下的点位，且不清除编辑时已添加至该项目的点位
            this.pointDataInMap = this.pointDataInMap.filter(item => {
              return (this.existingWisdomData.toString().includes(item.pointId) || item.planId !== e.planId);
            });
            // 清除地图标记点
            this.clearAllMarkerPoint();
            this.renderPlanPoint(this.pointDataInMap);
            // 已选智慧杆列表删除该规划下的点位，且不清除编辑时已添加至该项目的点位
            this.selectWisdomDataSet = this.selectWisdomDataSet.filter(item => {
              return (this.existingWisdomData.toString().includes(item.pointId) || item.planId !== e.planId);
            });
            this.highLightDevice(this.selectWisdomDataSet);
          }
        }
      ]
    };
  }


  /**
   * 初始化已选智慧杆列表表格配置
   */
  private initSelectWisdomTable(): void {
    const columnConfig = PlanningListTableUtil.getWisdomListColumnConfig(this, this.$nzI18n);
    columnConfig.forEach(item => {
      item.configurable = false;
    });
    columnConfig.push(
      { // 操作列
        title: this.commonLanguage.operate,
        searchable: true,
        searchConfig: {type: 'operate'},
        key: '', width: 80,
        fixedStyle: {fixedRight: true, style: {right: '0px'}}
      });
    this.selectWisdomTableConfig = {
      noIndex: true,
      isDraggable: true,
      isLoading: false,
      outHeight: 108,
      notShowPrint: true,
      showSizeChanger: false,
      showSearchSwitch: true,
      showPagination: true,
      scroll: {x: '510px', y: '340px'},
      columnConfig: columnConfig,
      rightTopButtons: [
        {
          // 清空已选智慧杆
          text: this.language.clearWisdom,
          iconClassName: 'fiLink-clear-all-icon',
          handle: () => {
            this.selectWisdomDataSet = [];
            this.clearAllMarkerPoint();
            this.renderPlanPoint(this.pointDataInMap);
          }
        },
        {
          // 批量删除已选智慧杆
          text: this.language.batchDelete,
          iconClassName: 'fiLink-delete',
          handle: (e) => {
            if (_.isEmpty(e)) {
              return;
            }
            const deleteIds = e.map(item => item.pointId);
            // 列表去除选中的删除
            this.selectWisdomDataSet = this.selectWisdomDataSet.filter(item => {
              return !deleteIds.includes(item.pointId);
            });
            this.clearSelectStyleById(deleteIds);
          }
        }
      ],
      operation: [
        // 删除
        {
          text: this.commonLanguage.deleteBtn,
          className: 'fiLink-delete red-icon',
          handle: (e) => {
            this.selectWisdomDataSet = this.selectWisdomDataSet.filter(item => item.pointId !== e.pointId);
            // 去除该高亮
            this.clearSelectStyleById([e.pointId]);
          }
        }
      ]
    };
  }

  /**
   * 查询当前窗口下，根据规划id查询该规划中没有分配项目的智慧杆点位
   */
  private selectPointByPlanIdAndNoProject(): Promise<PlanPointModel> {
    // 项目选中的规划
    const planIdList = [];
    this.modelPresetDataSet.forEach(item => {
      if (item.productId) {
        planIdList.push(item.planId);
      }
    });
    // 当前窗口经纬度
    const points = MapServiceUtil.getWindowIsArea(this.mapService.mapInstance);
    const params = {
      planIdList: planIdList,
      points: points
    };
    return new Promise((resolve, reject) => {
      this.$planApiService.selectPointByPlanIdAndNoProject(params).subscribe((result: ResultModel<PlanPointModel>) => {
        if (result.code === ResultCodeEnum.success && result.data) {
          result.data.pointInfoList.forEach(item => {
            item['facilityId'] = item.pointId;
            item['lng'] = item.xposition;
            item['lat'] = item.yposition;
            item['cloneCode'] = item.planId;
            item['code'] = null;
            item['show'] = true;
            item['deviceType'] = 'D002';
            item['productModel'] = this.currentPlanData.productModel;
            item['productId'] = this.currentPlanData.productId;
          });
          // 清除设施或设备以外所有的点
          this.clearAllMarkerPoint();
          // 要渲染到地图的点
          this.currentWindowPointData = result.data.pointInfoList;
          // 清空要渲染的点位数据
          this.pointDataInMap = [];
          // 当前窗口未归属项目的点位数据加上本项目之前已存在的点位数据
          this.pointDataInMap = this.pointDataInMap.concat(this.currentWindowPointData, this.existingWisdomData);
          // 去重
          this.pointDataInMap = _.uniqBy(this.pointDataInMap, 'pointId');
          this.renderPlanPoint(this.pointDataInMap);
          if (!_.isEmpty(this.selectWisdomDataSet)) {
            this.highLightDevice(this.selectWisdomDataSet);
          }
          resolve(result.data);
        }
      }, (error) => {
        this.$message.error(this.indexLanguage.networkTips);
        reject(error);
      });
    });

  }

  /**
   * 清除所有地图标记点
   *
   */
  private clearAllMarkerPoint(): void {
    // 清除设施或设备以外所有的点
    if (this.mapService.markerClusterer) {
      if (this.mapService.mapInstance) {
        this.mapService.mapInstance.clearOverlays();
      }
      if (this.mapService.markerClusterer) {
        this.mapService.markerClusterer.clearMarkers();
      }
    }
  }
}
