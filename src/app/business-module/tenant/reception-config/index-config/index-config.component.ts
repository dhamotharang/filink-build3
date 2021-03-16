import {Component, Input, OnInit} from '@angular/core';
import {TenantLanguageInterface} from '../../../../../assets/i18n/tenant/tenant.language.interface';
import {TenantApiService} from '../../share/sevice/tenant-api.service';
import {ActivatedRoute, Router} from '@angular/router';
import {NzI18nService, NzModalService} from 'ng-zorro-antd';
import {RuleUtil} from '../../../../shared-module/util/rule-util';
import {FiLinkModalService} from '../../../../shared-module/service/filink-modal/filink-modal.service';
import {LanguageEnum} from '../../../../shared-module/enum/language.enum';
import {ResultModel} from '../../../../shared-module/model/result.model';
import {ResultCodeEnum} from '../../../../shared-module/enum/result-code.enum';
import {CommonLanguageInterface} from '../../../../../assets/i18n/common/common.language.interface';
import {CommonUtil} from '../../../../shared-module/util/common-util';

@Component({
  selector: 'app-index-config',
  templateUrl: './index-config.component.html',
  styleUrls: ['./index-config.component.scss']
})
export class IndexConfigComponent implements OnInit {
  // 首页配置数据
  public homePageElementList;
  // 备份首页配置数据
  public dataChange;
  // 按钮loading
  public submitLoading = false;
  // 左上角默认选中
  public leftTitleDefault = 'deviceEquipmentList';
  // 右上角默认选中
  public rightTitleDefault = 'basicInfo';
  // 左上角卡片数据
  public leftCardData = [];
  // 右上角卡片数据
  public rightCardData = [];
  // 右侧统计状态
  public statisticsStatus = '';
  // 左侧卡片状态
  public leftStatus = '';
  // 右侧卡片状态
  public rightStatus = '';
  // 左侧数据
  public leftData = [];
  // 右侧数据
  public rightData = [];
  // 卡片数据
  public statisticsData = [];
  // 租户id
  public tenantId: string = '';
  // 是否为点击保存配置
  public confirmSave: boolean = true;

  // 国际化
  public language: TenantLanguageInterface;
  // 公共语言包
  public commonLanguage: CommonLanguageInterface;

  constructor(
    public $tenantApiService: TenantApiService,
    public $router: Router,
    public $nzI18n: NzI18nService,
    public $ruleUtil: RuleUtil,
    public $active: ActivatedRoute,
    private $message: FiLinkModalService,
    private $activatedRoute: ActivatedRoute,
    public modalService: NzModalService,
  ) {
  }

  ngOnInit() {
    // 国际化
    this.language = this.$nzI18n.getLocaleData(LanguageEnum.tenant);
    // 通用国际化
    this.commonLanguage = this.$nzI18n.getLocaleData('common');
    this.queryTenantConfig();
  }

  /**
   * 查询首页/设施/告警配置数据
   */
  public queryTenantConfig() {
    this.$activatedRoute.queryParams.subscribe(params => {
      this.tenantId = params.id;
      this.$tenantApiService.queryElementById(this.tenantId).subscribe((result: ResultModel<any>) => {
        if (result.code === ResultCodeEnum.success) {
          // 保存首页配置数据
          this.homePageElementList = CommonUtil.deepCopy(result.data.homePageElementList || []);
          // 备份首页配置数据
          this.dataChange = CommonUtil.deepCopy(result.data.homePageElementList || []);
          // 对数据进行分类
          this.homePageElementList.forEach(item => {
            if (item.elementCode === 'leftTopCard') {
              this.leftData = item.children;
              this.leftStatus = item.isShow;
            }
            if (item.elementCode === 'deviceDetailsCard') {
              this.rightData = item.children;
              this.rightStatus = item.isShow;
            }
            if (item.elementCode === 'right') {
              this.statisticsData = item.children;
              this.statisticsStatus = item.isShow;
            }
          });
          // 默认选中卡片
          this.titleClick('deviceEquipmentList', 'leftTopCard');
          this.titleClick('deviceDetails', 'deviceDetailsCard');
        }
      });
    });
  }


  /**
   * 卡片title切换
   * event：标题选中样式的切换
   * card：切换的模块，左侧卡片/右侧卡片/右侧统计条
   */
  public titleClick(event, card) {
    // 左侧卡片
    if (card === 'leftTopCard') {
      this.leftTitleDefault = event;
      this.leftData.forEach(item => {
        if (item.elementCode === event) {
          this.leftCardData = item.children;
        }
      });
    }
    // 右侧卡片
    if (card === 'deviceDetailsCard') {
      this.rightTitleDefault = event;
      this.rightData.forEach(item => {
        if (item.elementCode === event) {
          this.rightCardData = item.children;
        }
      });
    }
    this.getDataChangs();
  }


  /**
   * 模块显示
   * status: 切换的状态
   * card：切换的模块，左侧卡片/右侧卡片/右侧统计条
   */
  public titleIconClick(status, card) {
    const statu = status === '1' ? '0' : '1';
    if (card === 'leftTopCard') {
      this.leftStatus = statu;
      this.leftData.forEach(item => {
        item.isShow = statu;
        item.children.forEach(_item => {
          _item.isShow = statu;
        });
      });
    } else if (card === 'deviceDetailsCard') {
      this.rightStatus = statu;
      this.rightData.forEach(item => {
        item.isShow = statu;
        item.children.forEach(_item => {
          _item.isShow = statu;
        });
      });
    } else if (card === 'right') {
      this.statisticsStatus = statu;
      this.statisticsData.forEach(item => {
        item.isShow = statu;
      });
    }

    this.homePageElementList.forEach(item => {
      if (item.elementCode === card) {
        item.isShow = statu;
      }
    });
    this.getDataChangs();
  }

  /**
   * 图标点击事件
   * data: 所点击的父级数据
   * elementCode：所点击的数据名称
   * titleClick：是否为标题总开关
   */
  public iconClick(data, elementCode, titleClick?) {
    let status;
    data.forEach(item => {
      if (item.elementCode === elementCode) {
        item.isShow = item.isShow === '1' ? '0' : '1';
        status = item.isShow;
      }
    });
    // 如果为标题切换，则标题下数据状态一同改变
    if (titleClick) {
      let arr = [];
      this.leftData.forEach(item => {
        if (item.elementCode === elementCode) {
          arr = item.children;
        }
      });
      this.rightData.forEach(item => {
        if (item.elementCode === elementCode) {
          arr = item.children;
        }
      });
      arr.forEach(item => {
        item.isShow = status;
      });
    }
    this.getDataChangs();
  }


  /**
   * 确认事件
   */
  public updateMenuTemplate(): void {
    // 保存配置
    this.updateElement();


  }


  /**
   * 保存数据
   */
  public updateElement() {
    this.submitLoading = true;
    this.getDataChangs();
    const body = {
      tenantId: this.tenantId,
      alarmElementList: null,
      deviceElementList: null,
      homePageElementList: this.homePageElementList
    };
    this.$tenantApiService.updateElementById(body).subscribe((result: ResultModel<any>) => {
      this.submitLoading = false;
      if (result.code === ResultCodeEnum.success) {
        this.$message.success(this.language.tenantConfigMsg);
        if (this.confirmSave) {
          // 刷新数据
          this.queryTenantConfig();
        }
      } else {
        this.$message.warning(result.msg);
      }
    }, () => {
      this.submitLoading = false;
    });
  }


  /**
   * 数据改变
   */
  public getDataChangs() {
    this.homePageElementList.forEach(item => {
      if (item.elementCode === 'leftTopCard') {
        item.children = this.leftData;
      }
      if (item.elementCode === 'deviceDetailsCard') {
        item.children = this.rightData;
      }
      if (item.elementCode === 'right') {
        item.children = this.statisticsData;
      }
    });
  }


  /**
   * 取消按钮，回列表
   */
  public cancel(): void {
    const dataChang = this.comparedDatas();
    if (dataChang) {
      this.confirm();
    } else {
      // 返回租户列表
      this.$router.navigate(['/business/tenant/tenant-list']).then();
    }

  }

  /**
   * 对比数据是否有改变
   */
  public comparedDatas() {
    if (this.homePageElementList && this.dataChange) {
      // 保存首页配置数据
      const data = JSON.stringify(this.homePageElementList).toString();
      const dataChange = JSON.stringify(this.dataChange).toString();
      if (data === dataChange) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }

  }


  /**
   * 确认弹窗
   */
  public confirm(): void {
    this.modalService.warning({
      nzTitle: this.language.saveConfigMsg,
      nzContent: this.language.beenSaveConfigMsg,
      nzOkText: this.commonLanguage.cancel,
      nzOkType: 'danger',
      nzCancelText: this.commonLanguage.confirm,
      nzMaskClosable: false,
      nzOnCancel: () => {
        // true为点击配置保存按钮,false为弹框保存
        this.confirmSave = false;
        // 保存配置
        this.updateElement();
        // 返回租户列表
        this.$router.navigate(['/business/tenant/tenant-list']).then();
      },
      nzOnOk: () => {
        this.$router.navigate(['/business/tenant/tenant-list']).then();
      }
    });
  }


}
