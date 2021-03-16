import {AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {MapControl} from '../util/map-control';
import {MapStoreService} from '../../../core-module/store/map.store.service';
import {MapService} from '../../../core-module/api-service/index/map';
import {IndexApiService} from '../service/index/index-api.service';
import {FacilityService} from '../../../core-module/api-service/facility/facility-manage';
import {ActivatedRoute, Router} from '@angular/router';
import {NzI18nService, NzModalService} from 'ng-zorro-antd';
import {FiLinkModalService} from '../../../shared-module/service/filink-modal/filink-modal.service';
import {IndexMissionService} from '../../../core-module/mission/index.mission.service';
import {FacilityDetailPanelComponent} from '../index-component/facility-detail-panel/facility-detail-panel.component';
import {SessionUtil} from '../../../shared-module/util/session-util';
import {MapConfig} from '../../../shared-module/component/map/map.config';
import {MapAbstract} from '../../../shared-module/component/map/map-abstract';
import {MapComponent} from '../../../shared-module/component/map/map.component';
import {indexFacilityPanel} from '../shared/const/index-const';
import {Title} from '@angular/platform-browser';
import {ResultCodeEnum} from '../../../shared-module/enum/result-code.enum';
import {MapCoverageService} from '../../../shared-module/service/index/map-coverage.service';
import {PositionService} from '../service/position.service';
import {FacilityShowService} from '../../../shared-module/service/index/facility-show.service';
import {FilterConditionService} from '../service/filter-condition.service';
import {PositionFacilityShowService} from '../service/position-facility-show.service';
import {FacilitiesDetailsModel} from '../../../core-module/model/index/facilities-details.model';
import {MapTypeEnum} from '../../../shared-module/enum/filinkMap.enum';
import * as lodash from 'lodash';
import {DeviceAreaModel} from '../shared/model/device-area.model';
import {EquipmentAreaModel} from '../../../core-module/model/index/equipment-area.model';
import {AlarmAreaModel} from '../shared/model/alarm-area.model';
import {MapEventTypeEnum, ViewEnum} from '../../../core-module/enum/index/index.enum';
import {FacilityForCommonUtil} from '../../../core-module/business-util/facility/facility-for-common.util';
import {IndexCoverageTypeEnum} from '../shared/enum/index-enum';
import {INDEX_CARD_TYPE} from '../../../core-module/const/index/index.const';
import {ResultModel} from '../../../shared-module/model/result.model';
import {mapIconConfig} from '../../../shared-module/service/map-service/map.config';
import {ConfigModel} from '../shared/model/config-model';
import {MapDataModel} from '../../../core-module/model/index/map-data-model';
import {StatisticsConfigModel} from '../shared/model/statistics-config-model';
import {DetailCodeModel} from '../shared/model/detail-code-model';
import {AlarmListHomeModel} from '../shared/model/alarm-list-home-model';
import {statisticsIconConst} from '../shared/const/statistics-icon-const';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

declare const MAP_TYPE;

/**
 *  初始化首页板块（地图、设施详情、设施列表、我的关注、拓扑高亮等）
 */
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapIndexComponent extends MapControl implements OnInit, AfterViewInit, OnDestroy {
  // 地图设置temp
  @ViewChild('MapConfigTemp') MapConfigTemp: TemplateRef<any>;
  // 地图
  @ViewChild('mainMap') mainMap: MapComponent;
  // 设施详情
  @ViewChild('facilityDetailPanelComponent') facilityDetailPanelComponent: FacilityDetailPanelComponent;
  // 选中的设施id
  public facilityId: string;
  // 选中的设施设备id对象集合
  public idData;
  // 选中的设施name
  public facilityName: string;
  // 地图类型
  public mapType: string;
  // 地图配置
  public mapConfig: MapConfig;
  // 地图服务
  public mapService: MapAbstract;
  // 地图设施图标大小
  public facilityIconSizeValue: string;
  // 地图设施图标大小配置
  public facilityIconSizeConfig: ConfigModel[];
  // 设施图标大小
  public iconSize: string;
  // 设施数据
  public data: MapDataModel[];
  // 设施详情tab页选中的index
  public selectedIndex: number = indexFacilityPanel.facilityDetail;
  // 聚合点设施list
  public clustererFacilityList: MapDataModel[];
  // 权限code
  public facilityPowerCode: string[] = [];
  // public tables;
  // 是否显示设施详情tab
  public isShowFacilityDetailTab: boolean = true;
  // 是否显示设施详情面板
  public isShowOpenFacilityPanel: boolean = false;
  // 光交箱和配件架才显示实景图
  public isShowBusinessPicture: boolean = false;
  // 是否显示所有的卡片
  public isShowCard: boolean = false;
  // 设施收藏相关推送
  public facilityNoticeArr = ['focusDevice', 'unFollowDevice'];
  // 是否显示加载进度条
  public isShowProgressBar: boolean = false;
  // 进度条初始进度
  public percent: number;
  // 进度条增长百分比
  public increasePercent: number;
  // 进度条的定时器
  private scheduleTime: number;
  // 区域数据
  public areaData: string[];
  // 右侧统计配置
  public statisticsConfig: StatisticsConfigModel[] = [];
  // 卡片类型
  public cardType = INDEX_CARD_TYPE;
  // 卡片类型图片
  public cardIcon = statisticsIconConst;
  // 设施设备类型
  public facilityType = IndexCoverageTypeEnum.facility;
  // 中心点
  public centerPoint: string[];
  // 其他模块跳转定位
  public deviceLocation: FacilitiesDetailsModel;
  public equipmentLocation: FacilitiesDetailsModel;
  // 设施交集数据
  public facilityStoreData = [];
  // 设备交集数据
  public equipmentStoreData: string[];
  // 添加分组权限
  public roleSelect: boolean = false;
  // 告警权限
  public roleAlarm: boolean = false;
  public initMapDevice: boolean = false;
  // 地图设施/设备类型
  public mapTypeEnum = MapTypeEnum;
  // 设施图层区域模型
  public deviceAreaModel: DeviceAreaModel = new DeviceAreaModel;
  // 设备图层区域模型
  public equipmentAreaModel: EquipmentAreaModel = new EquipmentAreaModel;
  // 设施图层区域告警模型
  public alarmAreaModel: AlarmAreaModel = new AlarmAreaModel;
  // 设施总数/不同类型的设施总数
  public deviceCount: boolean = false;
  // 设施状态
  public deviceStatus: boolean = false;
  // 当前告警总数
  public alarmCount: boolean = false;
  // 告警增量
  public alarmIncrement: boolean = false;
  // 工单增量
  public workIncrement: boolean = false;
  // 繁忙设施TOP/告警设施TOP
  public topRole: boolean = false;
  // 打开设施详情卡时展示的设施类型
  public facilityCode: string;
  // 关闭订阅流
  private destroy$ = new Subject<void>();
  // 当前视图
  public viewIndex = ViewEnum.maintenanceView;
  // 运维视图
  public maintenanceView = ViewEnum.maintenanceView;
  // 项目视图
  public projectView = ViewEnum.projectView;
  // 规划视图
  public planView = ViewEnum.planView;

  // 构造器
  constructor(
    public $nzI18n: NzI18nService,
    private $mapStoreService: MapStoreService,
    private $facilityService: FacilityService,
    private $mapService: MapService,
    private $indexApiService: IndexApiService,
    private $title: Title,
    private $message: FiLinkModalService,
    private $router: Router,
    private $modal: NzModalService,
    private $activatedRoute: ActivatedRoute,
    private $modalService: FiLinkModalService,
    private $indexMissionService: IndexMissionService,
    private $MapCoverageService: MapCoverageService,
    private $facilityShowService: FacilityShowService,
    private $filterConditionService: FilterConditionService,
    private $positionService: PositionService,
    private $positionFacilityShowService: PositionFacilityShowService,
  ) {
    super($nzI18n);
  }

  mapShowRefresh = lodash.debounce(() => {
    this.queryHomeData();
  }, 1000, {leading: false, trailing: true});

  ngOnInit(): void {
    this.roleSelect = SessionUtil.checkHasRole('03-9-1');
    this.roleAlarm = SessionUtil.checkHasRole('02');
    window.addEventListener('popstate', function () {
      sessionStorage.setItem('backHistory', 'backHistory');
    }, {passive: false, capture: true});
    // 初始化地图配置
    this.mapInit();
    // 运维地图加载
    if (this.viewIndex === this.maintenanceView) {
      this.maintenanceViewMap();
    }
    // 项目地图加载
    if (this.viewIndex === this.projectView) {
      this.projectViewMap();
    }
    // 规划地图加载
    if (this.viewIndex === this.planView) {
      this.planViewMap();
    }

  }

  ngAfterViewInit(): void {
    this.$title.setTitle(`FiLink - ${this.indexLanguage.home}`);
    // 配置统计信息
    this.getStatisticsConfig();
    // 获取全部地图配置
    this.getAllMapConfig();
    // 其他页面路由跳转数据
    this.otherLocation();
  }

  ngOnDestroy(): void {
    // 清除加载条的定时器
    if (this.scheduleTime) {
      clearInterval(this.scheduleTime);
    }
    sessionStorage.removeItem('backHistory');
    this.$mapStoreService.mapLastID = this.facilityId;
    this.data = [];
    this.$MapCoverageService.showCoverage = null;
    this.$mapStoreService.resetConfig();
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * 视图切换
   */
  viewSwitch(event) {
    if (this.viewIndex !== event) {
      this.viewIndex = event;
      // 清空模糊查询
      this.mainMap.clearSearch();
      // 运维地图加载
      if (this.viewIndex === this.maintenanceView) {
        this.refresh();
      }
      // 项目地图加载
      if (this.viewIndex === this.projectView) {
        this.projectViewMap();
      }
      // 规划地图加载
      if (this.viewIndex === this.planView) {
        this.planViewMap();
      }
    }
  }

  /**
   * 地图初始化配置加载
   */
  mapInit() {
    // 初始化地图配置
    this.facilityNoticeArr = ['focusDevice', 'unFollowDevice'];
    this.mapType = MAP_TYPE;
    this.mapConfig = new MapConfig('index-map', this.mapType, mapIconConfig.defaultIconSize, []);
    // 初始化地图类型
    this.$mapStoreService.mapType = this.mapType;
    // 配置图标大小
    this.facilityIconSizeConfig = mapIconConfig.iconConfig;
    // 默认设施图标大小
    this.iconSize = mapIconConfig.defaultIconSize;
    // 设施点图标大小
    this.facilityIconSizeValue = mapIconConfig.defaultIconSize;
    // 检查用户
    this.checkUser();
  }

  /**
   * 运维地图区域点加载
   */
  maintenanceViewMap() {
    // 设置默认图层
    this.$MapCoverageService.showCoverage = this.mapTypeEnum.facility;

    // 监听设施设备列表定位
    this.$positionService.eventEmit.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      if (value.positionBase) {
        this.facilityCardLocation(value);
      }
    });
    // 地图分层切换重新获取设施或设备数据
    this.$facilityShowService.subject.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      if (value.mapShowType) {
        // 切换图层清空地图数据
        if (this.mainMap.mapService.mapInstance) {
          this.mainMap.mapService.mapInstance.clearOverlays();
        }
        if (this.mainMap.mapService.markerClusterer) {
          this.mainMap.mapService.markerClusterer.clearMarkers();
        }
      }
      // 获取区域点防抖
      this.mapShowRefresh();
    });
    // 设施设备列表筛选条件变化重新获取设施或设备数据
    this.$filterConditionService.eventEmit.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      if (value.refresh) {
        // 运维地图加载
        if (this.viewIndex === this.maintenanceView) {
          // 获取区域点防抖
          this.mapShowRefresh();
        }
        // 项目地图加载
        if (this.viewIndex === this.projectView) {
          this.projectViewMap();
        }
        // 规划地图加载
        if (this.viewIndex === this.planView) {
          this.planViewMap();
        }
      }
    });
    // 统计卡片权限查询
    this.queryDeviceRole();
  }

  /**
   * 项目地图项目点加载
   */
  projectViewMap() {

    const data = {
      'filterConditions': [
        {
          'filterField': 'projectId',
          'operator': 'in',
          'filterValue': [
            '4',
            '5'
          ]
        },
        {
          'filterField': 'pointModel',
          'operator': 'in',
          'filterValue': [
            'E32',
            'E31',
            'E30'
          ]
        },
        {
          'filterField': 'supplierId',
          'operator': 'in',
          'filterValue': [
            'fe8PlVu9jwQkx32fACK'
          ]
        }
      ]
    };

    this.$indexApiService.getProjectPolymerizationPoint(data).subscribe((result: ResultModel<any>) => {
      if (result.code === ResultCodeEnum.success) {
        console.log(result.data);
        result = {
          'code': '00000',
          'msg': '请求成功',
          'data': {
            'projectData': [
              {
                'projectId': '4',
                'projectName': '东湖项目777',
                'projectCode': 'test777',
                'longitude': '114.39897',
                'latitude': '30.46259',
                'count': 2,
                'poleModelMap': {
                  'E30': 1,
                  'E32': 1
                },
                'poleStatusMap': {
                  'running': 1,
                  'runnable': 1
                }
              },
              {
                'projectId': '5',
                'projectName': '西湖项目666',
                'projectCode': 'zest666',
                'longitude': '114.39897',
                'latitude': '30.46259',
                'count': 1,
                'poleModelMap': {
                  'E31': 1
                },
                'poleStatusMap': {
                  'running': 1
                }
              }
            ],
            'longitude': '114.39897',
            'latitude': '30.46259',
          }
        };
        this.centerPoint = [result.data.longitude, result.data.latitude];
        this.planProjectCacheData(result.data.projectData);
      }
    });
  }

  /**
   * 规划地图规划点加载
   */
  planViewMap() {
    const data = {
      'filterConditions': [
        {
          'filterField': 'planId',
          'operator': 'in',
          'filterValue': [
            '3',
            '4'
          ]
        },
        {
          'filterField': 'pointModel',
          'operator': 'in',
          'filterValue': [
            'E32',
            'E31',
            'E30'
          ]
        }
      ]
    };

    this.$indexApiService.getPlanPolymerizationPoint(data).subscribe((result: ResultModel<any>) => {
      if (result.code === ResultCodeEnum.success) {
        console.log(result.data);
        this.centerPoint = [result.data.longitude, result.data.latitude];
        console.log(this.centerPoint);
        this.planProjectCacheData(result.data.planData);
      }
    });

  }

  /**
   * 获取地图配置信息
   */
  getAllMapConfig() {
    // 获取全部设施的配置
    this.$mapService.getALLFacilityConfig().subscribe((result: ResultModel<any>) => {
      if (result.code === ResultCodeEnum.success) {
        // 更新设施图标
        if (result.data && result.data.deviceIconSize) {
          this.facilityIconSizeValue = result.data.deviceIconSize;
          this.$mapStoreService.facilityIconSize = result.data.deviceIconSize;
          this.iconSize = result.data.deviceIconSize;
        }
      } else {
        this.$message.error(result.msg);
      }
    }, () => {
      this.$message.remove();
    });
  }


  /**
   * 其他页面跳转
   */
  otherLocation() {
    const deviceId = this.$activatedRoute.snapshot.queryParams.deviceId;
    const equipmentId = this.$activatedRoute.snapshot.queryParams.equipmentId;
    if (deviceId) {
      this.$indexApiService.queryDeviceById(deviceId).subscribe((result: ResultModel<FacilitiesDetailsModel>) => {
        if (result.code === ResultCodeEnum.success && result.data) {
          this.convertInfo(result.data, MapTypeEnum.facility);
        }
      }, () => {
        this.$message.warning(this.indexLanguage.networkTips);
      });
    } else if (equipmentId) {
      this.$indexApiService.queryHomeEquipmentInfoById(equipmentId).subscribe((result: ResultModel<FacilitiesDetailsModel>) => {
        if (result.code === ResultCodeEnum.success && result.data) {
          this.convertInfo(result.data, MapTypeEnum.equipment);
        }
      }, () => {
        this.$message.warning(this.indexLanguage.networkTips);
      });
    } else {
      return;
    }
  }

  /**
   * 转换数据
   * param data
   */
  public convertInfo(data, mapType): void {
    // 判断是设施还是设备
    const selectType = MapTypeEnum.facility === mapType;
    const centerPoint = data.positionBase.split(',');
    data['lng'] = +centerPoint[0];
    data['lat'] = +centerPoint[1];
    data['facilityType'] = selectType ? 'device' : 'equipment';
    this.$MapCoverageService.showCoverage = selectType ? this.mapTypeEnum.facility : this.mapTypeEnum.equipment;
    if (selectType) {
      this.deviceLocation = data;
      this.$positionFacilityShowService.eventEmit.emit({type: 'facility'});
    } else {
      this.equipmentLocation = data;
      this.$positionFacilityShowService.eventEmit.emit({type: 'equipment', equipmentType: data.equipmentType});
    }
  }


  /**
   * 详情卡定位
   */
  facilityCardLocation(value): void {
    const a = value.positionBase.split(',');
    value.code = null;
    value.lng = +a[0];
    value.lat = +a[1];
    // 存入缓存
    if (this.$MapCoverageService.showCoverage === this.mapTypeEnum.facility) {
      // 点击设备定位时，设施Id和设备Id同时存在，需根据分层决定
      value.facilityId = value.deviceId;
    } else {
      value.facilityId = value.equipmentId;
    }
    this.mainMap.locationById('', value);
  }

  /**
   * 检查用户是否改变
   */
  public checkUser(): void {
    // 用户改变，清空缓存
    if (SessionUtil.getToken() !== this.$mapStoreService.token) {
      this.$mapStoreService.resetData();
      this.$mapStoreService.resetConfig();
      this.data = [];
    }
    this.$mapStoreService.token = SessionUtil.getToken();
  }


  /**
   * 区域数据查询
   */
  public queryHomeData(): void {
    this.showProgressBar();
    // 获取区域点
    if (this.$mapStoreService) {
      this.queryHomeDeviceArea().then(result => {
        this.listAreaByAreaCodeList(result).then(_result => {
          // 获取告警数据
          this.queryAlarmListHome(result);
        });
      });
    } else {
      this.hideProgressBar();
    }
  }


  /**
   * 检查首次加载
   */
  public queryHomeDeviceArea() {
    // 缓存读取筛选条件区域数据
    const areaStoreData = this.$mapStoreService.areaSelectedResults || [];
    // 缓存读取筛选条件设施类型数据
    if (this.$mapStoreService.facilityTypeSelectedResults.length) {
      this.facilityStoreData = [];
      this.$mapStoreService.facilityTypeSelectedResults.forEach(item => {
        this.$mapStoreService.showFacilityTypeSelectedResults.forEach(_item => {
          if (item === _item) {
            this.facilityStoreData.push(item);
          }
        });
      });
      if (!this.facilityStoreData.length && this.initMapDevice && this.$mapStoreService.showFacilityTypeSelectedResults &&
        this.$mapStoreService.showFacilityTypeSelectedResults && this.$mapStoreService.showFacilityTypeSelectedResults.length) {
        this.facilityStoreData = ['noData'];
      }
    } else {
      this.facilityStoreData = this.$mapStoreService.showFacilityTypeSelectedResults;
    }
    // 缓存读取筛选条件设备类型数据
    if (this.$mapStoreService.equipmentTypeSelectedResults.length) {
      this.equipmentStoreData = [];
      this.$mapStoreService.equipmentTypeSelectedResults.forEach(item => {
        if (item === this.$mapStoreService.showEquipmentTypeSelectedResults[0]) {
          this.equipmentStoreData = [item];
        }
      });
      if (!this.equipmentStoreData.length) {
        this.equipmentStoreData = ['noData'];
      }
    } else {
      this.equipmentStoreData = this.$mapStoreService.showEquipmentTypeSelectedResults;
    }
    let requestHeader;
    if (this.$MapCoverageService.showCoverage === this.mapTypeEnum.facility) {
      // 设施参数
      this.deviceAreaModel.polymerizationType = '1';
      this.deviceAreaModel.filterConditions.area = areaStoreData ? areaStoreData : [];
      this.deviceAreaModel.filterConditions.device = this.facilityStoreData ? this.facilityStoreData : [];
      const testData = this.deviceAreaModel;
      this.$mapStoreService.polymerizationConfig = testData;
      requestHeader = this.$indexApiService.queryDevicePolymerizationList(testData);
    } else {
      // 设备参数
      this.equipmentAreaModel.polymerizationType = '1';
      this.equipmentAreaModel.filterConditions.area = areaStoreData ? areaStoreData : [];
      this.equipmentAreaModel.filterConditions.equipment = this.equipmentStoreData ? this.equipmentStoreData : [];
      const testData = this.equipmentAreaModel;
      this.$mapStoreService.polymerizationConfig = testData;
      requestHeader = this.$mapService.queryEquipmentPolymerizationList(testData);
    }
    return new Promise((resolve, reject) => {
      // 设施的区域接口
      requestHeader.subscribe((result: ResultModel<any>) => {
        if (result.code === ResultCodeEnum.success) {
          if (result.data.polymerizationData && result.data.polymerizationData.length) {
            const data = result.data;
            resolve(data);
            this.hideProgressBar();
          } else {
            this.cacheData([]);
            this.mainMap.mapService.locateToUserCity();
            this.hideProgressBar();
          }
        } else {
          this.mainMap.mapService.locateToUserCity();
          this.hideProgressBar();
        }
      }, () => {
        this.mainMap.mapService.locateToUserCity();
        this.hideProgressBar();
      });
    });
  }

  /**
   * 获取全量的区域数据，包括子集
   */
  public listAreaByAreaCodeList(data) {
    return new Promise((resolve, reject) => {
      const areaList = data.polymerizationData.map(item => {
        return item.code;
      });
      this.$indexApiService.listAreaByAreaCodeList(areaList).subscribe((result: ResultModel<any>) => {
        if (result.code === ResultCodeEnum.success) {
          resolve(result.data.map((item) => {
            return item.areaCode;
          }));
        }
      });
    });
  }

  /**
   * 查询区域告警数据
   */
  public queryAlarmListHome(data) {
    if (!data.polymerizationData.length) {
      this.mainMap.mapService.markerClusterer.clearMarkers();
      return;
    }
    this.centerPoint = data.positionCenter.split(',');
    const alarmData = new AlarmAreaModel();
    alarmData.filterConditions[0].filterField = this.$MapCoverageService.showCoverage === 'facility' ? 'alarm_device_type_id' : 'alarm_source_type_id';
    alarmData.filterConditions[0].filterValue = this.$MapCoverageService.showCoverage === 'facility' ? this.facilityStoreData : this.equipmentStoreData;
    this.$mapStoreService.alarmDataConfig = alarmData;
    this.cacheData(data.polymerizationData);
    this.hideProgressBar();
  }


  /**
   * 刷新
   */
  public refresh(): void {
    // 重新刷新区域点数据
    this.queryHomeData();
    // 清空搜索栏
    this.mainMap.clearSearch();
  }

  /**
   * 缓存运维视图区域数据
   * param data
   */
  public cacheData(data): void {
    // 更新标记点
    data.forEach(item => {
      if (item.positionCenter) {
        const position = item.positionCenter.split(',');
        item.lng = parseFloat(position[0]);
        item.lat = parseFloat(position[1]);
        delete item.positionCenter;
        if (this.$mapStoreService) {
          this.$mapStoreService.updateMarker(item, true);
        }
      }
    });
    // 更新地图数据
    this.data = data;
    this.initMapDevice = true;
  }

  /**
   * 缓存规划视图规划点数据
   * param data
   */
  public planProjectCacheData(data): void {
    // 更新标记点
    data.forEach(item => {
      item.lng = parseFloat(item.longitude);
      item.lat = parseFloat(item.latitude);
      if (this.$mapStoreService) {
        this.$mapStoreService.updateMarker(item, true);
      }
    });
    // 更新地图数据
    this.data = data;
    console.log(data);
  }

  /**
   * 显示加载进度条
   */
  public showProgressBar(): void {
    this.percent = 0;
    this.increasePercent = 5;
    this.isShowProgressBar = true;
    this.scheduleTime = window.setInterval(() => {
      if (this.percent >= 100) {
        clearInterval(this.scheduleTime);
      } else {
        this.percent += this.increasePercent;
        if (this.percent === 50) {
          this.increasePercent = 2;
        } else if (this.percent === 80) {
          this.increasePercent = 1;
        } else if (this.percent === 99) {
          this.increasePercent = 0;
        }
      }
    }, 500);
  }

  /**
   * 隐藏加载进度条
   */
  public hideProgressBar(): void {
    this.percent = 100;
    setTimeout(() => {
      this.isShowProgressBar = false;
    }, 1000);
  }


  /**
   * 打开设施详情卡
   * param target
   */
  public openPanel(event): void {
    // 初始化默认
    this.isShowOpenFacilityPanel = false;
    // 关闭右键
    this.mainMap.closeRightClick();
    let request;
    if (event.facilityType === this.mapTypeEnum.device) {
      request = this.$indexApiService.getDeviceDetailCode({deviceType: event.facilityCode, deviceId: event.id});
      this.deviceLocation = null;
    }
    if (event.facilityType === this.mapTypeEnum.equipment) {
      request = this.$indexApiService.getEquipmentDetailCode({equipmentId: event.id});
      this.equipmentLocation = null;
    }
    // 获取设施详情页面模块权限id
    request.subscribe((result: ResultModel<DetailCodeModel[]>) => {
      if (result.code === ResultCodeEnum.success) {
        const data = result.data || [];
        this.facilityPowerCode = data.map(item => item.id);
        if (this.facilityPowerCode.length) {
          setTimeout(() => {
            this.openFacilityCard();
          }, 50);
        } else {
          this.facilityPowerCode.push('detail');
          setTimeout(() => {
            this.openFacilityCard();
          }, 50);
        }
      }
    }, () => {
      this.$message.warning(this.indexLanguage.networkTips);
    });
    // 关闭所有卡片
    this.isShowCard = true;
    // 关闭设施状态
    this.isExpandFacilityStatus = false;
    // 点击展开或隐藏所有的卡片
    this.ClickAllItems();
  }

  /**
   * 打开设施详情面板
   * param event
   */
  public openFacilityCard(): void {
    // 设施详情
    this.isShowFacilityDetailTab = true;
    this.selectedIndex = indexFacilityPanel.facilityDetail;
    this.showFacilityPanel();
  }

  /**
   * 关闭设施详情面板
   * param event
   */
  public closePanel(): void {
    this.hideFacilityPanel();
    this.hideClustererFacilityTable();
  }

  /**
   * 地图事件回传
   * param event
   */
  public mapEvent(event): void {
    if (event.type === MapEventTypeEnum.mapClick) {
      // 关闭设施详情面板
      this.closePanel();
      this.mainMap.closeRightClick();
    } else if (event.type === MapEventTypeEnum.clickClusterer) {
      // 打开聚合点table
      this.clustererFacilityList = event.data;
      this.showClustererFacilityTable();
    } else if (event.type === MapEventTypeEnum.cityListControlStatus) {
      // 城市控件打开与关闭
      if (event.value) {
        this.hideLeftComponents();
      } else {
        this.showLeftComponents();
      }
    } else if (event.type === MapEventTypeEnum.cityChange) {
      // 城市切换
      this.showLeftComponents();
    } else if (event.type === MapEventTypeEnum.selected) {
      // 设施选中，打开设施详情面板
      this.closePanel();
      if (event.id && event.facilityCode && event.facilityType) {
        this.facilityCode = event.facilityCode;
        this.facilityId = event.id;
        this.idData = event.idData;
        this.facilityName = event.name;
        this.openPanel(event);
      }
    } else if (event.type === MapEventTypeEnum.mapBlackClick) {
      // 设施选中，打开设施详情面板
      this.closePanel();
    } else if (event.type === MapEventTypeEnum.mapDrag) {
      // 地图拖动
      this.closePanel();
      this.mainMap.closeRightClick();
    }
  }


  /**
   * 隐藏设施列表
   */
  public hideFacilityPanel(): void {
    this.isShowFacilityPanel = false;
    this.facilityId = null;
  }

  /**
   * 首页卡片权限查询
   */
  queryDeviceRole() {
    // 设施总数/不同类型的设施总数
    this.deviceCount = SessionUtil.checkHasRole('07-2-1');
    // 设施状态
    this.deviceStatus = SessionUtil.checkHasRole('07-2-2');
    // 当前告警总数
    this.alarmCount = SessionUtil.checkHasRole('07-1-1');
    // 告警增量
    this.alarmIncrement = SessionUtil.checkHasRole('07-1-5');
    // 工单增量
    this.workIncrement = SessionUtil.checkHasRole('07-3-11');
    // 繁忙设施TOP/告警设施TOP
    this.topRole = SessionUtil.checkHasRole('07-8');
  }


  /**
   * 首页卡片显示的配置文件
   * param  label 标签
   * param  title 标题
   * param  type  顺序显示位置
   * param  isShow 是否展示
   */
  getStatisticsConfig(): void {

    if (this.deviceCount) {
      if (SessionUtil.checkHasTenantRole('3-1')) {
        this.statisticsConfig.push({
          label: this.indexLanguage.card.deviceCount,
          title: this.indexLanguage.card.deviceCount,
          type: this.cardType.deviceCount,
          icon: this.cardIcon.deviceCount,
          isShow: false
        });
      }
      if (SessionUtil.checkHasTenantRole('3-2')) {
        this.statisticsConfig.push({
          label: this.indexLanguage.card.typeCount,
          title: this.indexLanguage.card.dfTypeDeviceCount,
          type: this.cardType.typeCount,
          icon: this.cardIcon.typeCount,
          isShow: false
        });
      }
    }
    if (this.deviceStatus && SessionUtil.checkHasTenantRole('3-3')) {
      this.statisticsConfig.push({
        label: this.indexLanguage.card.deviceStatus,
        title: this.indexLanguage.card.deviceStatus,
        type: this.cardType.deviceStatus,
        icon: this.cardIcon.deviceStatus,
        isShow: false
      });
    }
    if (this.alarmCount && SessionUtil.checkHasTenantRole('3-4')) {
      this.statisticsConfig.push({
        label: this.indexLanguage.card.alarmCount,
        title: this.indexLanguage.card.currentAlarmCount,
        type: this.cardType.alarmCount,
        icon: this.cardIcon.alarmCount,
        isShow: false
      });
    }
    if (this.alarmIncrement && SessionUtil.checkHasTenantRole('3-5')) {
      this.statisticsConfig.push({
        label: this.indexLanguage.card.alarmINC,
        title: this.indexLanguage.card.alarmIncrement,
        type: this.cardType.alarmIncrement,
        icon: this.cardIcon.alarmIncrement,
        isShow: false
      });
    }
    if (this.workIncrement && SessionUtil.checkHasTenantRole('3-6')) {
      this.statisticsConfig.push({
        label: this.indexLanguage.card.workINC,
        title: this.indexLanguage.card.workIncrement,
        type: this.cardType.workIncrement,
        icon: this.cardIcon.workIncrement,
        isShow: false
      });
    }
    if (this.topRole) {
      if (SessionUtil.checkHasTenantRole('3-7')) {
        this.statisticsConfig.push({
          label: this.indexLanguage.card.busyTop,
          title: this.indexLanguage.card.busyDeviceTop,
          type: this.cardType.busyTop,
          icon: this.cardIcon.busyTop,
          isShow: false
        });
      }
      if (SessionUtil.checkHasTenantRole('3-8')) {
        this.statisticsConfig.push({
          label: this.indexLanguage.card.alarmTop,
          title: this.indexLanguage.card.alarmDeviceTop,
          type: this.cardType.alarmTop,
          icon: this.cardIcon.alarmTop,
          isShow: false
        });
      }
    }
    this.statisticsConfig.push({
      label: '测试统计图',
      title: '测试统计图',
      type: this.cardType.ceshi,
      icon: this.cardIcon.deviceCount,
      isShow: false
    });
  }

// 点击展开或隐藏所有的卡片
  public ClickAllItems(): void {
    // 关闭设施详情面板
    if (this.isShowFacilityPanel) {
      this.closePanel();
    }
    // 关闭设施状态
    this.isExpandFacilityStatus = false;
    // 展开或隐藏所有的卡片
    this.statisticsConfig.forEach(_item => _item.isShow = !this.isShowCard);
    this.isShowCard = !this.isShowCard;
  }

  // 点击展开或隐藏卡片
  statisticsItemClick(item): void {
    // 关闭设施详情面板
    if (this.isShowFacilityPanel) {
      this.closePanel();
    }
    // 关闭设施状态
    this.isExpandFacilityStatus = false;
    // 是否全选
    if (item.isShow && this.isShowCard) {
      this.isShowCard = !this.isShowCard;
    }
    // 是否展示
    if (!item.isShow && item.type !== 0) {
      // 总数一定显示
      this.statisticsConfig[0].isShow = true;
      item.isShow = true;
      return;
    }
    item.isShow = !item.isShow;
  }

  /**
   * 打开地图配置modal
   */
  openMapSettingModal(): void {
    const modal = this.$modal.create({
      nzTitle: this.indexLanguage.mapConfigTitle,
      nzContent: this.MapConfigTemp,
      nzOkType: 'danger',
      nzMaskClosable: false,
      nzClassName: 'custom-create-modal',
      nzOnCancel: () => {
        // 还原到上次配置
        this.facilityIconSizeConfig = mapIconConfig.iconConfig;
        this.facilityIconSizeValue = this.$mapStoreService.facilityIconSize;
        modal.destroy();
      },
      nzFooter: [
        {
          label: this.commonLanguage.confirm,
          onClick: () => {
            // 入参为百度地图数据，不建立数据模型
            this.modifyMapConfig(modal);
            this.isShowFacilityPanel = false;
          }
        },
        {
          label: this.commonLanguage.cancel,
          type: 'danger',
          onClick: () => {
            // 还原到上次配置
            this.facilityIconSizeConfig = mapIconConfig.iconConfig;
            this.facilityIconSizeValue = this.$mapStoreService.facilityIconSize;
            modal.destroy();
          }
        },
      ]
    });
  }

  /**
   * 修改地图配置
   */
  modifyMapConfig(modal): void {
    const data = {configValue: this.facilityIconSizeValue};
    this.$message.loading(this.commonLanguage.saving);
    this.$mapService.modifyFacilityIconSize(data).subscribe((result: ResultModel<any>) => {
      // 出参没有data，不建立数据模型
      if (result.code !== ResultCodeEnum.success) {
        this.$message.remove();
        this.$message.error(result.msg);
        return;
      }
      this.$message.remove();
      this.$message.success(this.commonLanguage.operateSuccess);
      if (this.$mapStoreService.facilityIconSize !== this.facilityIconSizeValue) {
        this.$mapStoreService.facilityIconSize = this.facilityIconSizeValue;
        this.iconSize = this.facilityIconSizeValue;
      }
      setTimeout(() => {
        modal.destroy();
        this.$message.remove();
      }, 500);
    }, () => {
      this.$message.remove();
    });
  }
}
