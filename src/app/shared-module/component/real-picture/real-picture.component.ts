import {Component, OnInit, OnChanges, ViewChild, Input, Output, EventEmitter, SimpleChanges, ElementRef} from '@angular/core';
import {NzI18nService} from 'ng-zorro-antd';
import {IndexLanguageInterface} from '../../../../assets/i18n/index/index.language.interface';
import {IndexFacilityService} from '../../../core-module/api-service/index/facility';
import {EquipmentStatusEnum, EquipmentTypeEnum} from '../../../core-module/enum/equipment/equipment.enum';
import {DeviceStatusEnum} from '../../../core-module/enum/facility/facility.enum';
import {ResultModel} from '../../model/result.model';
import {ResultCodeEnum} from '../../enum/result-code.enum';
import {CommonUtil} from '../../util/common-util';
import {LanguageEnum} from '../../enum/language.enum';
import * as _ from 'lodash';
import {CommonLanguageInterface} from '../../../../assets/i18n/common/common.language.interface';
import {FacilityForCommonUtil} from '../../../core-module/business-util/facility/facility-for-common.util';
import {PositionTypeEnum} from '../../../core-module/enum/product/product.enum';
import {BusinessStatusEnum} from '../../../business-module/facility/share/enum/equipment.enum';
import {FiLinkModalService} from '../../service/filink-modal/filink-modal.service';

@Component({
  selector: 'app-real-picture',
  templateUrl: './real-picture.component.html',
  styleUrls: ['./real-picture.component.scss']
})
export class RealPictureComponent implements OnInit, OnChanges {
  @Input() isShowPoint;
  // 设施Id
  @Input() deviceId: string;
  // 是否显示未挂载设备的槽位点
  @Input() isShowRoundPoint: boolean = false;
  // 是否显示悬浮窗
  @Input() isUpData: boolean = false;
  // 是否导出
  @Input() isExport: boolean;
  // 是否开启杆体示意图编辑模式
  @Input() isOpenUpData: boolean;
  // 点击事件回传
  @Output() clickChange = new EventEmitter();
  // 鼠标移动事件回传
  @Output() mousemoveChange = new EventEmitter();
  // 新增设备点击事件回传
  @Output() addEquipment = new EventEmitter();
  // 已有设备点击事件回传
  @Output() hasEquipment = new EventEmitter();
  @Output() clearEquipment = new EventEmitter();
  // 杆体信息回传
  @Output() clubInformation = new EventEmitter();
  @ViewChild('canvas') canvas: ElementRef;
  // 获取qunee实例
  public Q = window['Q'];
  // 获取画布实例
  public graph;
  public isShowClick: boolean = false;
  // 浮窗距离左边
  public left: number = 10;
  // 浮窗距离右边
  public top: number = 10;
  // 点击浮窗距离左边
  public clickLeft: number = 10;
  // 点击浮窗距离右边
  public clickTop: number = 10;
  // 浮窗是否显示
  public isShow = false;
  // 浮窗设备名称
  public floatWindowEquipmentName: string;
  // 浮窗设备类型
  public floatWindowEquipmentType: string;
  // 摄像头类型（球形枪型）
  public floatWindowEquipmentModelType: string;
  // 浮窗设备状态
  public floatWindowEquipmentStatus: string;
  // 浮窗设备型号
  public floatWindowEquipmentModel: string;
  // 浮窗资产编号
  public floatWindowEquipmentNo: string;
  // 浮窗安装时间
  public floatWindowEquipmentInstallationTime: string;
  // 首页国际化
  public indexLanguage: IndexLanguageInterface;
  // 设备信息集合
  public equipmentData = [];
  // 设备详情信息集合
  public equipmentDetailsData;
  // 设施类型枚举
  public indexEquipmentTypeEnum = EquipmentTypeEnum;
  // 国际化枚举
  public languageEnum = LanguageEnum;
  // 工具类
  public commonUtil = CommonUtil;
  // 设施状态枚举
  public deviceStatusEnum = DeviceStatusEnum;
  // 设施状态枚举
  public equipmentStatusEnum = EquipmentStatusEnum;
  public addEquipmentType = [];
  public mountPosition;
  // 国际化
  public commonLanguage: CommonLanguageInterface;
  // 设施基础信息
  public deviceDetail;
  // 初始化次数
  initNum: number = 0;

  constructor(public $nzI18n: NzI18nService,
              private $message: FiLinkModalService,
              private $indexService: IndexFacilityService) {
  }

  ngOnInit(): void {
    // 初始化国际化
    this.indexLanguage = this.$nzI18n.getLocaleData(LanguageEnum.index);
    // 获取词条
    this.commonLanguage = this.$nzI18n.getLocaleData(LanguageEnum.common);
    setTimeout(() => {
      this.initCanvas();
      setTimeout(() => {
        if (this.graph) {
          this.graph.zoomToOverview();
          this.graph.clear();
        }
        this.initCanvas();
      }, 2000);
      this.operationEvent();
    }, 0);

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.graph) {
      this.graph.zoomToOverview();
      this.graph.clear();
      this.initCanvas();
    }
  }

  /**
   * 初始化
   */
  public initCanvas(): void {
    if (this.graph === undefined) {
      // 初始化画布
      this.graph = new this.Q.Graph('canvas');
    }
    // 画布所在的HTML元素布满整个容器
    // this.graph.updateViewport();
    // 初始坐标原点位于屏幕中心，默认为true，false为左上角
    this.graph.originAtCenter = true;
    // 移动到中心
    this.graph.moveToCenter();
    // 获取设施基础信息
    this.$indexService.queryDeviceInfo({'deviceId': this.deviceId}).subscribe((result: ResultModel<any>) => {
      if (result.code === ResultCodeEnum.success) {
        this.deviceDetail = result.data[0];
      }
    });
    // 获取杆体信息
    this.getShaftInformation().then(list => {
      // 获取多个设备信息
      this.getEquipmentsDataList(list).then(value => {
        // 组合数据
        this.equipmentData.forEach(item => {
          this.equipmentDetailsData.forEach(_item => {
            if (item.equipment && item.equipment.equipmentId === _item.equipmentId) {
              item.detail = _item;
            }
          });
        });
        this.equipmentData.forEach(item => {
          // 创建设备
          if (item.equipment) {
            const point = item.equipment.position.split(',');
            const pointNode = this.createNodes('', Number(point[0]), Number(point[1]), item.equipment.url, 2, item.equipment.equipmentId, item.detail);
          } else {
            if (this.isShowRoundPoint) {
              const point = item.equipmentType[0].position.split(',');
              const pointNode = this.createNodes(item.point, Number(point[0]), Number(point[1]));
              pointNode.image = this.Q.Shapes.getShape(this.Q.Consts.SHAPE_CIRCLE, 0, 0, 40, 40);
              pointNode.setStyle(this.Q.Styles.SHAPE_STROKE_STYLE, '#fff');
              pointNode.setStyle(this.Q.Styles.SHAPE_FILL_COLOR, '#36cfc9');
              pointNode.setStyle(this.Q.Styles.LABEL_POSITION, this.Q.Position.CENTER_MIDDLE);
              pointNode.setStyle(this.Q.Styles.LABEL_ANCHOR_POSITION, this.Q.Position.CENTER_MIDDLE);
              pointNode.setStyle(this.Q.Styles.LABEL_COLOR, '#fff');
              pointNode.setStyle(this.Q.Styles.LABEL_FONT_SIZE, 32);
              pointNode['$equipmentType'] = item.equipmentType;
            }
          }
        });
      });
    });
  }

  /**
   * 获取杆体信息
   */
  public getShaftInformation() {
    return new Promise(resolve => {
      // 获取杆体示意图信息
      this.$indexService.getPoleInfoByDeviceId({'deviceId': this.deviceId}).subscribe((result: ResultModel<any>) => {
        if (result.code === ResultCodeEnum.success) {
          this.clubInformation.emit(result.data);
          // 创建智慧杆主体
          this.createNodes('', 0, 0, result.data.picUrl, 1, result.data.deviceId, null, result.data);
          this.equipmentData = _.uniqBy(result.data.configLiveArray.concat(result.data.configArray), 'point');
          if (this.equipmentData.filter(item => item.equipment).length > 0) {
            resolve(this.equipmentData.filter(item => item.equipment).map(item => item.equipment.equipmentId));
          } else {
            resolve([]);
          }
        }
      });
    });
  }

  /**
   * 获取多个设备详细信息
   */
  public getEquipmentsDataList(list) {
    return new Promise(resolve => {
      this.$indexService.queryEquipmentInfoList(list).subscribe((equipmentResult: ResultModel<any>) => {
        if (equipmentResult.code === ResultCodeEnum.success) {
          this.equipmentDetailsData = equipmentResult.data;
          resolve(this.equipmentDetailsData);
        }
      });
    });
  }

  /**
   * 创建节点信息
   * param x
   * param y
   */
  public createNodes(nodeName, x, y, img?, zIndex?, id?, detail?, rodDetail?) {
    const node = this.graph.createNode(nodeName, x, y);
    // 是否可以移动
    node.movable = false;
    // 图片路径
    node.image = img;
    // 显示层级
    node.zIndex = zIndex;
    // 添加ID信息
    if (id) {
      node.$equipment = id;
    }
    if (detail) {
      node.$detail = detail;
    }
    if (rodDetail) {
      node.$rodDetail = rodDetail;
    }
    return node;
  }

  /**
   * 操作事件
   */
  public operationEvent(): void {
    // 鼠标点击事件
    this.graph.onclick = (evt) => {
      const a = evt.getData();
      if (evt.getData() && evt.getData().$detail && this.isShowPoint !== '1') {
        // 首页实景图
        this.clickLeft = evt.layerX;
        this.clickTop = evt.layerY;
        this.isShow = true;
        this.clickChange.emit(evt.getData());
      } else if (evt.getData() && this.isShowPoint === '1') {
        // 设施杆型图
        this.mountPosition = evt.getData().$name;
        if (evt.getData().$equipmentType) {
          this.addEquipmentType = evt.getData().$equipmentType.map(item => item.type);
          this.clickLeft = evt.layerX;
          this.clickTop = evt.layerY;
          let flag = true;
          this.equipmentData.forEach(item => {
            if (item.point === this.mountPosition && item.pointType === PositionTypeEnum.expandPoint && this.deviceDetail.businessStatus === BusinessStatusEnum.lockEquipment) {
              // 锁定状态的智慧杆无法操作扩展点位
              this.$message.error(this.indexLanguage.expandErrorInfo);
              flag = false;
            }
          });
          this.isShowClick = flag;
        }
        this.clickChange.emit(evt.getData());
      } else {
        this.isShowClick = false;
      }
    };
    // 鼠标移动事件
    this.graph.onmousemove = (evt) => {
      const canvasWidth = this.canvas.nativeElement.clientWidth;
      const canvasHeight = this.canvas.nativeElement.clientHeight;
      if (evt.getData() && evt.getData().$detail && !this.isUpData) {
        // 浮窗设备名称
        this.floatWindowEquipmentName = evt.getData().$detail.equipmentName;
        // 浮窗设备类型
        if (this.floatWindowEquipmentType === 'E005') {
          this.floatWindowEquipmentModelType = evt.getData().$detail.equipmentModelType;
        }
        this.floatWindowEquipmentType = evt.getData().$detail.equipmentType;
        // 浮窗设备状态
        this.floatWindowEquipmentStatus = evt.getData().$detail.equipmentStatus;
        // 浮窗设备型号
        this.floatWindowEquipmentModel = evt.getData().$detail.equipmentModel;
        // 浮窗资产编号
        this.floatWindowEquipmentNo = evt.getData().$detail.equipmentCode;
        // 浮窗安装时间
        this.floatWindowEquipmentInstallationTime = evt.getData().$detail.installationDate;
        this.isShow = true;
        if (evt.layerX + 200 > canvasWidth) {
          this.left = canvasWidth - 180;
        } else {
          this.left = evt.layerX + 20;
        }
        if (evt.layerY + 200 > canvasHeight) {
          this.top = canvasHeight - 300;
        } else {
          this.top = evt.layerY;
        }
      } else {
        this.isShow = false;
      }
    };
    // 鼠标开始拖拽事件
    this.graph.startdrag = (evt) => {
      this.isShowClick = false;
    };
  }

  /**
   * 获取设备Icon样式
   */
  public getEquipmentIconStyle(type?: string, cameraType?) {
    if (type === 'E005') {
      if (cameraType === '01') {
        return 'iconfont facility-icon fiLink-camera all-facility-color';
      } else {
        return 'iconfont facility-icon fiLink-shexiangtou-qiuji all-facility-color';
      }
    } else {
      return CommonUtil.getEquipmentIconClassName(type);
    }
  }

  /**
   * 已有设备点击事件
   */
  public haveEquipment(): void {
    this.isShow = false;
    this.hasEquipment.emit({equipment: this.addEquipmentType, mountPosition: this.mountPosition});
  }

  /**
   * 新增设备点击事件
   */
  public createEquipment(): void {
    this.isShow = false;
    this.addEquipment.emit({equipment: this.addEquipmentType, mountPosition: this.mountPosition, deviceDetail: this.deviceDetail});
  }

  public resetQ() {
    this.graph.clear();
    this.isShowClick = false;
    // 保存的移动设备节点位置清空
    // 网关配置信息
    this.initCanvas();
  }

  /**
   * 导出图片
   */
  public onExport(): boolean {
    return FacilityForCommonUtil.onPrint(this.graph, this.commonLanguage);
  }
}
