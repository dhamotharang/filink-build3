import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import {Router} from '@angular/router';
import {NzI18nService} from 'ng-zorro-antd';
import {FinalValueEnum} from '../../../../core-module/enum/step-final-value.enum';
import {FormItem} from '../../../../shared-module/component/form/form-config';
import {FormOperate} from '../../../../shared-module/component/form/form-operate.service';
import {RuleUtil} from '../../../../shared-module/util/rule-util';
import {FacilityLanguageInterface} from '../../../../../assets/i18n/facility/facility.language.interface';
import {CodingStandardApiService} from '../../share/service/coding-standard/coding-standard-api.service';
import {FiLinkModalService} from '../../../../shared-module/service/filink-modal/filink-modal.service';
import {LanguageEnum} from '../../../../shared-module/enum/language.enum';
import {CommonUtil} from '../../../../shared-module/util/common-util';
import {CodingRangeEnum} from '../../share/enum/coding-standard.enum';
import {SET_DATA} from '../../share/const/coding-standard.const';
import {CommonLanguageInterface} from '../../../../../assets/i18n/common/common.language.interface';

@Component({
  selector: 'app-coding-detail',
  templateUrl: './coding-detail.component.html',
  styleUrls: ['./coding-detail.component.scss']
})
export class CodingDetailComponent implements OnInit {
  // 资产类型选择器模版
  @ViewChild('assetTypeTemp') public assetTypeTemp: TemplateRef<HTMLDocument>;
  // 设施语言包
  public language: FacilityLanguageInterface;
  /** 公共国际化*/
  public commonLanguage: CommonLanguageInterface;
  // 页面标题
  public pageTitle: string = '';
  // 选中的步骤数
  public isActiveSteps = FinalValueEnum.STEPS_FIRST;
  // 步骤条的步骤枚举
  public finalValueEnum = FinalValueEnum;
  // 步骤条的值
  public setData = SET_DATA;
  // 表单参数
  public formColumn: FormItem[] = [];
  // 表单状态
  public formInstance: FormOperate;
  // 下一步按钮是否禁用
  public nextButtonDisable: boolean = false;
  // 提交loading
  public isSaveLoading: boolean = false;

  constructor(
    public $nzI18n: NzI18nService,
    public $CodingStandardApiService: CodingStandardApiService,
    public $message: FiLinkModalService,
    private $router: Router,
    private $ruleUtil: RuleUtil
  ) { }

  ngOnInit() {
    // 国际化
    this.language = this.$nzI18n.getLocaleData(LanguageEnum.facility);
    this.commonLanguage = this.$nzI18n.getLocaleData(LanguageEnum.common);
    // 初始化表单
    this.initColumn();
    // 新增编辑页面初始化
    // this.initPage();
  }

  /**
   * 表单实例校验
   */
  public codingFormInstance(event: { instance: FormOperate }): void {
    // this.formInstance = event.instance;
    // this.formInstance.group.statusChanges.subscribe(() => {
    //   this.isNextStepDisabled = !(this.formInstance.getRealValid() && this.selectUnitName);
    // });
  }

  /**
   * 打开资产类型选择弹窗
   */
  public showAssetTypeSelect(): void {
  }

  /**
   * 上一步
   * @ param val 当前步骤
   */
  public handPrevSteps(val: number): void {
    this.isActiveSteps = val - 1;
    this.setData[1].activeClass = '';
  }

  /**
   * 下一步
   * @ param val 当前步骤
   */
  public handNextSteps(val: number): void {
    this.isActiveSteps = val + 1;
    this.setData[1].activeClass = 'active';
  }

  /**
   * 提交
   */
  public handStepsSubmit(): void {
    // this.submitNotify.emit();
  }

  /**
   * 取消
   */
  public handCancelSteps(): void {
    // this.cancelNotify.emit();
  }

  /**
   * 初始化表单
   */
  private initColumn(): void {
    this.formColumn = [
      {
        // 名称
        label: this.language.codingStandard.codingName,
        key: '',
        type: 'input',
        require: true,
        rule: [
          {required: true},
          RuleUtil.getNameMaxLengthRule(),
          this.$ruleUtil.getNameRule()
        ],
        customRules: [this.$ruleUtil.getNameCustomRule()],
        // asyncRules: [
        //   this.$ruleUtil.getNameAsyncRule(value =>
        //     //   this.$facilityApiService.queryDeviceNameIsExist({deviceId: this.deviceId, deviceName: value}),
        //     // res => {
        //     //   return !res.data;
        //     // })
        //   )
        // ]
      },
      { // 资产类型
        label: this.language.codingStandard.assetType,
        key: '',
        type: 'custom',
        template: this.assetTypeTemp,
        require: true,
        rule: [{required: true}],
      },
      { // 编码范围
        label: this.language.codingStandard.codingRange, key: '', type: 'select',
        placeholder: this.language.pleaseChoose,
        selectInfo: {
          data: CommonUtil.codeTranslate(CodingRangeEnum, this.$nzI18n, null, LanguageEnum.facility),
          label: 'label',
          value: 'code',
        },
        require: true,
        rule: [{required: true}],
      },
      { // 备注
        label: this.language.remarks, key: 'remarks',
        type: 'textarea',
        col: 24,
        rule: [this.$ruleUtil.getRemarkMaxLengthRule(), this.$ruleUtil.getNameRule()],
        customRules: [this.$ruleUtil.getNameCustomRule()],
      },
    ];
  }
}
