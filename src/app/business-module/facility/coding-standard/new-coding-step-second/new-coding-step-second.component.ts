import { Component, OnInit } from '@angular/core';
import {FormItem} from '../../../../shared-module/component/form/form-config';
import {FormOperate} from '../../../../shared-module/component/form/form-operate.service';
import {FacilityLanguageInterface} from '../../../../../assets/i18n/facility/facility.language.interface';
import {LanguageEnum} from '../../../../shared-module/enum/language.enum';
import {RuleUtil} from '../../../../shared-module/util/rule-util';
import {CommonUtil} from '../../../../shared-module/util/common-util';
import {CodingRangeEnum} from '../../share/enum/coding-standard.enum';
import {NzI18nService} from 'ng-zorro-antd';

@Component({
  selector: 'app-new-coding-step-second',
  templateUrl: './new-coding-step-second.component.html',
  styleUrls: ['./new-coding-step-second.component.scss']
})
export class NewCodingStepSecondComponent implements OnInit {
  // 设施语言包
  public language: FacilityLanguageInterface;
  // 表单参数
  public formColumn: FormItem[] = [];
  // 表单状态
  public formInstance: FormOperate;

  constructor(
    public $nzI18n: NzI18nService,
    private $ruleUtil: RuleUtil
  ) { }

  ngOnInit() {
    // 国际化
    this.language = this.$nzI18n.getLocaleData(LanguageEnum.facility);
    this.initColumn();
  }

  /**
   * 表单实例校验
   */
  public newCodingFormInstance(event: { instance: FormOperate }): void {
    // this.formInstance = event.instance;
    // this.formInstance.group.statusChanges.subscribe(() => {
    //   this.isNextStepDisabled = !(this.formInstance.getRealValid() && this.selectUnitName);
    // });
  }

  /**
   * 初始化表单
   */
  private initColumn(): void {
    this.formColumn = [
      {
        // 一级
        label: this.language.codingStandard.firstLevel,
        key: '',
        type: 'select',
        placeholder: this.language.pleaseChoose,
        selectInfo: {
          data: CommonUtil.codeTranslate(CodingRangeEnum, this.$nzI18n, null, LanguageEnum.facility),
          label: 'label',
          value: 'code',
        },
        require: true,
        rule: [{required: true}],
      },
      {
        // 二级
        label: this.language.codingStandard.secondLevel,
        key: '',
        type: 'select',
        placeholder: this.language.pleaseChoose,
        selectInfo: {
          data: CommonUtil.codeTranslate(CodingRangeEnum, this.$nzI18n, null, LanguageEnum.facility),
          label: 'label',
          value: 'code',
        },
        require: true,
        rule: [{required: true}],
      },
      {
        // 三级
        label: this.language.codingStandard.thirdLevel,
        key: '',
        type: 'select',
        placeholder: this.language.pleaseChoose,
        selectInfo: {
          data: CommonUtil.codeTranslate(CodingRangeEnum, this.$nzI18n, null, LanguageEnum.facility),
          label: 'label',
          value: 'code',
        },
        require: true,
        rule: [{required: true}],
      },
      {
        // 四级
        label: this.language.codingStandard.fourthLevel,
        key: '',
        type: 'select',
        placeholder: this.language.pleaseChoose,
        selectInfo: {
          data: CommonUtil.codeTranslate(CodingRangeEnum, this.$nzI18n, null, LanguageEnum.facility),
          label: 'label',
          value: 'code',
        },
        require: true,
        rule: [{required: true}],
      },
      {
        // 五级
        label: this.language.codingStandard.fifthLevel,
        key: '',
        type: 'input',
        require: true,
        rule: [
          {required: true},
          RuleUtil.getNameMaxLengthRule(),
          this.$ruleUtil.getNameRule()
        ],
        customRules: [this.$ruleUtil.getNameCustomRule()],
      },
      {
        // 编码范围
        label: this.language.codingStandard.codingContent,
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
      { // 编码示例
        label: this.language.codingStandard.codingRange,
        key: '',
        type: 'input',
        require: true,
        rule: [
          {required: true},
          RuleUtil.getNameMaxLengthRule(),
          this.$ruleUtil.getNameRule()
        ],
        customRules: [this.$ruleUtil.getNameCustomRule()],
      },
    ];
  }
}
