import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {OperateTypeEnum} from '../../../../../shared-module/enum/page-operate-type.enum';
import {ActivatedRoute, Router} from '@angular/router';
import {CommonLanguageInterface} from '../../../../../../assets/i18n/common/common.language.interface';
import {ScheduleLanguageInterface} from '../../../../../../assets/i18n/schedule/schedule.language.interface';
import {LanguageEnum} from '../../../../../shared-module/enum/language.enum';
import {NzI18nService, NzModalService, NzTreeNode} from 'ng-zorro-antd';
import {FormItem} from '../../../../../shared-module/component/form/form-config';
import {FormOperate} from '../../../../../shared-module/component/form/form-operate.service';
import {RuleUtil} from '../../../../../shared-module/util/rule-util';
import {FinalValueEnum} from '../../../../../core-module/enum/step-final-value.enum';
import {SetPersonData} from '../../../share/const/schedule-steps.const';
import {TreeSelectorConfigModel} from '../../../../../shared-module/model/tree-selector-config.model';
import {UserForCommonUtil} from '../../../../../core-module/business-util/user/user-for-common.util';
import {ResultModel} from '../../../../../shared-module/model/result.model';
import {UserForCommonService} from '../../../../../core-module/api-service';
import {JobStatusEnum} from '../../../share/enum/job-status.enum';
import {UserLanguageInterface} from '../../../../../../assets/i18n/user/user-language.interface';
import {TelephoneInputComponent} from '../../../../../shared-module/component/telephone-input/telephone-input.component';
import {PhoneSetModel} from '../../../../../core-module/model/user/phone-set.model';
import {FilterCondition, QueryConditionModel} from '../../../../../shared-module/model/query-condition.model';
import {OperatorEnum} from '../../../../../shared-module/enum/operator.enum';
import {DepartmentUnitModel} from '../../../../../core-module/model/work-order/department-unit.model';
import {ScheduleApiService} from '../../../share/service/schedule-api.service';
import {AssociateUserComponent} from '../associate-user/associate-user.component';
import {StatusChangeEnum} from '../../../share/enum/status-change.enum';
import {ResultCodeEnum} from '../../../../../shared-module/enum/result-code.enum';
import {debounceTime, distinctUntilChanged, first, mergeMap} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {AsyncValidatorFn, FormControl} from '@angular/forms';
import {FiLinkModalService} from '../../../../../shared-module/service/filink-modal/filink-modal.service';
import {PersonInfoModel} from '../../../share/model/person-info.model';
import {SelectModel} from '../../../../../shared-module/model/select.model';

/**
 * 人员新增/编辑页面
 */
@Component({
  selector: 'app-person-detail',
  templateUrl: './person-detail.component.html',
  styleUrls: ['./person-detail.component.scss'],
  providers: []
})
export class PersonDetailComponent implements OnInit {
  // 获取关联用户组件的值
  @ViewChild('userInfo') userInfo: AssociateUserComponent;
  // 入职日期模板
  @ViewChild('entryTime') public entryTimeTemp: TemplateRef<HTMLDocument>;
  // 离职日期模板
  @ViewChild('leaveTime') public leaveTimeTemp: TemplateRef<HTMLDocument>;
  // 单位选择
  @ViewChild('department') private departmentTep;
  // 新增手机号模板
  @ViewChild('telephoneTemp') public telephoneTemp;
  // 手机号输入框
  @ViewChild('telephoneInput') public telephoneInput: TelephoneInputComponent;
  // 页面标题
  public pageTitle: string = '';
  // 公共国际化
  public commonLanguage: CommonLanguageInterface;
  // 国际化
  public scheduleLanguage: ScheduleLanguageInterface;
  // 用户国际化
  public userLanguage: UserLanguageInterface;
  // 表单参数
  public formColumn: FormItem[] = [];
  // 表单状态
  public formInstance: FormOperate;
  // 下一步按钮是否可点击
  public isNextStepDisabled: boolean = true;
  // 页面类型
  public pageType: string = OperateTypeEnum.add;
  // 单位选择器配置
  public areaSelectorConfig = new TreeSelectorConfigModel();
  // 显示单位选择器
  public areaSelectVisible: boolean = false;
  // 所选单位名称
  public selectUnitName: string = '';
  // 选中的步骤数
  public isActiveSteps = FinalValueEnum.STEPS_FIRST;
  // 步骤条的步骤枚举
  public finalValueEnum = FinalValueEnum;
  // 步骤条的值
  public setData = SetPersonData;
  // 提交loading
  public isSaveLoading: boolean = false;
  // 确认按钮是否可以点击
  public isConfirmDisabled: boolean = true;
  // 保存基本信息
  public stepsFirstParams: PersonInfoModel = new PersonInfoModel();
  // 选中单位结果
  public selectDeptData: DepartmentUnitModel = new DepartmentUnitModel();
  // 关联用户中在第二步不可见
  public notShowStepSecond: boolean = false;
  // 修改的用户id
  public userId: string = '';
  // 手机号校验
  public phoneNumberMsg: string = '';
  // 手机号数据
  public phoneValue: string = '';
  // 手机号国际码
  private countryCode: string = '86';
  // 手机号
  public telephone;
  // 树数据
  private treeNodes: any = [];
  // 人员id
  private personId: string;
  // 在职状态
  private jobStatusSelect: SelectModel[] = [];

  constructor(public $nzI18n: NzI18nService,
              public $scheduleService: ScheduleApiService,
              public $message: FiLinkModalService,
              private $router: Router,
              private $active: ActivatedRoute,
              private $modalService: NzModalService,
              private $ruleUtil: RuleUtil,
              private $userForCommonService: UserForCommonService) {
  }

  /**
   * 初始化
   */
  public ngOnInit(): void {
    // 初始国际化
    this.scheduleLanguage = this.$nzI18n.getLocaleData(LanguageEnum.schedule);
    this.commonLanguage = this.$nzI18n.getLocaleData(LanguageEnum.common);
    this.userLanguage = this.$nzI18n.getLocaleData(LanguageEnum.user);
    // 在职状态单选框值
    this.jobStatusSelect = [
      // 在职
      {label: this.scheduleLanguage.work, code: JobStatusEnum.work}
    ];
    // 第二步不可见关联用户的标题和确认、取消按钮
    this.notShowStepSecond = true;
    this.initForm();
    // 获取页面操作类型及标题
    this.initPage();
    // 获取单位信息
    this.getDept();
  }

  /**
   * 表单实例校验
   */
  public personFormInstance(event: { instance: FormOperate }): void {
    this.formInstance = event.instance;
    this.formInstance.group.statusChanges.subscribe(() => {
      this.isNextStepDisabled = !(this.formInstance.getRealValid() && this.selectUnitName);
    });
  }

  /**
   * 数据提交
   */
  public handStepsSubmit(): void {
    this.isSaveLoading = true;
    // 第一步和第二步得到的数据
    const formData = this.userInfo.formStatus.getRealData();
   formData.associatedUser = this.userInfo.selectAssociatedUserId;
    const data = Object.assign(this.stepsFirstParams, formData);
    // 如果有立即创建用户则先创建用户 再新增人员
    if (!this.personId) {
      data.leaveTime = '';
    } else {
      data.id = this.personId;
    }
    this.isSaveLoading = true;
    this.$scheduleService.savePersonInfo(data).subscribe((res: ResultModel<any>) => {
      this.isSaveLoading = false;
      if (res.code === ResultCodeEnum.success) {
        if (!this.personId) {
          this.$message.success(this.scheduleLanguage.addPersonSuccess);
        } else {
          this.$message.success(this.scheduleLanguage.updatePersonSuccess);
        }
        this.$router.navigate(['/business/schedule/person-information']).then();
      } else {
        this.$message.error(res.msg);
      }
    }, () => {
      this.isSaveLoading = false;
    });
  }

  /**
   * 取消操作
   */
  public handCancelSteps(): void {
    window.history.go(-1);
  }

  /**
   * 打开单位选择器
   */
  public showDeptSelectorModal(): void {
    // 编辑状态时选择打开单位选择器 需要判断当前人员是否在排班中 若是 则给出提示不允许修改单位
    if (this.personId) {
      this.$scheduleService.validateWhetherInOther(this.personId).subscribe((res: ResultModel<boolean>) => {
        if (res.code === ResultCodeEnum.success) {
          if (res.data) {
            this.$message.warning('人员已经在班组中不允许修改单位！');
            return;
          } else {
            this.areaSelectorConfig.treeNodes = this.treeNodes;
            this.areaSelectVisible = true;
          }
        }
      });
    }
    this.areaSelectorConfig.treeNodes = this.treeNodes;
    this.areaSelectVisible = true;
  }

  /**
   * 单位选中结果
   */
  public deptSelectChange(event: DepartmentUnitModel[]): void {
    this.selectDeptData = event[0];
    if (event[0]) {
      UserForCommonUtil.setAreaNodesStatus(this.treeNodes, event[0].id);
      this.selectUnitName = event[0].deptName;
      this.formInstance.resetControlData('deptCode', event[0].deptCode);
      // 重新选择单位 需要将下一步中的关联用户置空，需要选择该单位下的用户
      this.userInfo.formStatus.resetControlData('associatedUser', '');
    } else {
      UserForCommonUtil.setAreaNodesStatus(this.treeNodes, null);
      this.selectUnitName = '';
      this.formInstance.resetControlData('deptCode', null);
    }
  }

  /**
   * 第二步关联用户表单校验
   */
  public infoValid(valid: boolean): void {
    this.isConfirmDisabled = valid;
  }

  /**
   * 上一步
   * @ param val 当前步骤
   */
  public handPrevSteps(val: number): void {
    this.isActiveSteps = val - 1;
    // 第二步图标置灰
    this.setData[1].activeClass = '';
  }

  /**
   * 下一步
   * @ param val 当前步骤
   */
  public handNextSteps(val: number): void {
    this.isActiveSteps = val + 1;
    // 第二步图标点亮
    this.setData[1].activeClass = 'active';
    // 获取当前表单数据
    const data = this.formInstance.group.getRawValue();
    // 时间需要转化成时间戳
    data.entryTime = data.entryTime ? new Date(data.entryTime).getTime() : null;
    data.leaveTime = data.leaveTime ? new Date(data.leaveTime).getTime() : null;
    data.deptId = this.selectDeptData.id;
    data.countryCode = this.countryCode;
    data.personId = this.personId ? this.personId : null;
    data.deptName = this.selectUnitName;
    // 保存第一步的数据
    this.stepsFirstParams = data;
  }

  /**
   * 获取电话号码国际码
   */
  public getPhone(event: PhoneSetModel): void {
    this.countryCode = event.dialCode;
  }

  /**
   * 初始化电话号码
   */
  public getPhoneInit(event: any): void {
    this.telephone = event;
  }

  /**
   * 监听手机号码输入状态
   */
  public inputNumberChange(event: string): void {
    this.phoneNumberMsg = '';
    const reg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
    const _reg = /^\d+$/;
    const data = {phoneNumber: event, id: this.personId};
    // check中国手机号
    if (this.countryCode === '86') {
      if (reg.test(event)) {
        this.$scheduleService.checkPhoneNumber(data).subscribe((res: ResultModel<boolean>) => {
          if (res.code === ResultCodeEnum.success) {
            if (!res.data) {
              this.formInstance.resetControlData('phoneNumber', event);
            } else {
              this.phoneNumberMsg = this.userLanguage.phoneNumberExistTips;
              this.formInstance.resetControlData('phoneNumber', null);
            }
          } else {
            this.formInstance.resetControlData('phoneNumber', null);
          }
        });
      } else {
        this.phoneNumberMsg = event && this.userLanguage.phoneNumberTips;
        this.formInstance.resetControlData('phoneNumber', null);
      }
    } else {
      if (_reg.test(event)) {
        this.phoneNumberMsg = '';
        this.formInstance.resetControlData('phoneNumber', event);
      } else {
        this.phoneNumberMsg = event && this.userLanguage.phoneNumberTips;
        this.formInstance.resetControlData('phoneNumber', null);
      }
    }
    // this.formInstance.group.controls['phoneNumber'].markAsDirty();
  }

  /**
   * 初始化表单
   */
  private initForm(): void {
    this.formColumn = [
      {
        // 姓名
        label: this.scheduleLanguage.userName,
        key: 'personName',
        type: 'input',
        require: true,
        rule: [{required: true}, {maxLength: 32},
          this.$ruleUtil.getNameRule()],
        customRules: [this.$ruleUtil.getNameCustomRule()],
        asyncRules: [
          // 异步校验姓名在用户列表中的唯一性
          this.getUserNameRule(),
          this.$ruleUtil.getNameAsyncRule(value => this.$scheduleService.checkPersonName(
            {personName: value, id: this.personId}
            ),
            res => !res.data, this.scheduleLanguage.userNameExistTip)
        ]
      },
      {
        // 工号
        label: this.scheduleLanguage.jobNumber,
        key: 'jobNumber',
        type: 'input',
        col: 24,
        rule: [RuleUtil.getNameMaxLengthRule(20),
          RuleUtil.getNameMinLengthRule()],
        asyncRules: [
          this.$ruleUtil.getNameAsyncRule(value => this.$scheduleService.checkJobNumber(
            {jobNumber: value, id: this.personId}
            ),
            res => !res.data, this.scheduleLanguage.jobNumberExistTip)
        ]
      },
      {
        // 单位
        label: this.scheduleLanguage.unit,
        key: 'deptCode',
        type: 'custom',
        col: 24,
        require: true,
        rule: [],
        template: this.departmentTep
      },
      {
        // 手机号
        label: this.userLanguage.phoneNumber,
        key: 'phoneNumber',
        type: 'custom',
        require: true,
        col: 24,
        rule: [
          {required: true}
        ],
        asyncRules: [
          // 异步校验手机号在用户列表的唯一性
          this.phoneNumberRule()
        ],
        template: this.telephoneTemp
      },
      {
        // 岗位
        label: this.scheduleLanguage.workPosition,
        key: 'workPosition',
        type: 'input',
        col: 24,
        require: false,
        rule: [RuleUtil.getNameMaxLengthRule(20), RuleUtil.getNameMinLengthRule()]
      },
      {
        // 在职状态
        label: this.scheduleLanguage.jobStatus,
        key: 'onJobStatus',
        type: 'radio',
        require: true,
        rule: [{required: true}],
        initialValue: JobStatusEnum.work,
        radioInfo: {
          data: this.jobStatusSelect,
          label: 'label',
          value: 'code'
        },
        modelChange: (controls, $event) => {
          this.formInstance.setColumnHidden(['leaveTime'], $event !== JobStatusEnum.resign);
        }
      },
      { // 入职日期
        label: this.scheduleLanguage.entryTime,
        key: 'entryTime',
        type: 'custom',
        initialValue: new Date(),
        require: true,
        template: this.entryTimeTemp,
        rule: [{required: true}],
        asyncRules: []
      },
      { // 离职日期
        label: this.scheduleLanguage.leaveTime,
        key: 'leaveTime',
        type: 'custom',
        initialValue: new Date(),
        require: true,
        hidden: true,
        template: this.leaveTimeTemp,
        rule: [{required: true}],
        asyncRules: []
      }
    ];
  }

  /**
   * 初始化单位选择器配置
   */
  private initAreaSelectorConfig(nodes: NzTreeNode[]): void {
    this.areaSelectorConfig = {
      width: '500px',
      height: '300px',
      title: this.scheduleLanguage.unitSelect,
      treeSetting: {
        check: {
          enable: true,
          chkStyle: 'radio',
          radioType: 'all'
        },
        data: {
          simpleData: {
            enable: true,
            idKey: 'id',
            pIdKey: 'deptFatherId',
            rootPid: null
          },
          key: {
            name: 'deptName',
            children: 'childDepartmentList'
          },
        },
        view: {
          showIcon: false,
          showLine: false
        }
      },
      treeNodes: nodes
    };
  }

  /**
   * 获取部门列表信息
   * returns {Promise<any>}
   */
  private getDept() {
    this.$userForCommonService.queryTotalDept().subscribe((result: ResultModel<any>) => {
      this.treeNodes = result.data || [];
      // 初始化单位选择器配置
      this.initAreaSelectorConfig(result.data);
    });
  }

  /**
   * 编辑数据回显
   */
  private getPersonData(): void {
    this.$scheduleService.getPersonListById(this.personId).subscribe((result: ResultModel<PersonInfoModel>) => {
      if (result.code === ResultCodeEnum.success) {
        const data = result.data;
        // 单位名称回显
        this.selectUnitName = data.deptName;
        // 保存当前的单位id、单位code
        this.selectDeptData.id = data.deptId;
        this.selectDeptData.deptCode = data.deptCode;
        // 保存当前的关联用户id，用于关联用户选择器回显
        this.userInfo.selectAssociatedUserId = data.associatedUser;
        // 时间格式特殊需要单独处理
        data.entryTime = data.entryTime ? new Date(data.entryTime) : null;
        this.formInstance.setColumnHidden(['leaveTime'], data.onJobStatus !== JobStatusEnum.resign);
        // 编辑时如果离职日期为空，则默认为当前日期，不为空则展示当前离职日期
        data.leaveTime = data.leaveTime ? new Date(data.leaveTime) : new Date();
        // 手机号
        this.phoneValue = data.phoneNumber;
        if (data.countryCode) {
          this.telephoneInput.telephoneCode = `+${data.countryCode}`; // 国际码
        }
        this.telephoneInput._phoneNum = data.phoneNumber; // 电话号码
        this.formInstance.resetData(data);
        // 回显第二步中关联用户的姓名
        this.userInfo.formStatus.resetControlData('associatedUser', data.userName);
        // 递归设置部门的选择情况
        UserForCommonUtil.setAreaNodesStatus(this.treeNodes, data.deptId);
      }
    });
  }

  /**
   * 初始化页面
   */
  private initPage(): void {
    this.pageType = this.$active.snapshot.params.type;
    this.pageTitle = this.pageType === OperateTypeEnum.update ? this.scheduleLanguage.updatePerson : this.scheduleLanguage.addPerson;
    // 第二步图标状态置为空
    this.setData[1].activeClass = '';
    if (this.pageType !== OperateTypeEnum.add) {
      this.$active.queryParams.subscribe(params => {
        this.personId = params.personId;
        // 当为编辑状态时，需要展示可选的离职状态以及离职日期
        this.jobStatusSelect.push({label: this.scheduleLanguage.resign, code: JobStatusEnum.resign});
        // 编辑数据回显
        this.getPersonData();
      });
    }
  }


  /**
   * 姓名在用户列表中的唯一性校验
   */
  private getUserNameRule(): { asyncRule: AsyncValidatorFn, asyncCode: any, msg: string } {
    return {
      asyncRule: (control: FormControl) => {
        if (control.value) {
          return control.valueChanges.pipe(
            distinctUntilChanged(),
            debounceTime(1000),
            mergeMap(() => this.$userForCommonService.checkUserNameExist({userName: control.value.trim()})),
            mergeMap(res => {
              // 如果下一步中的立即创建用户为 是 则需要检测姓名在用户列表中的唯一性 并以弹窗的形式进行提醒
              if (this.userInfo.formStatus.getData('isCreate') === StatusChangeEnum.yes) {
                if (res.code === ResultCodeEnum.success) {
                  if (res.data === 1 || res.data === 2) {
                    return Observable.create(observe => {
                      this.$modalService.confirm({
                        nzTitle: this.scheduleLanguage.isContinueOperation,
                        nzOkType: 'danger',
                        nzContent: `<span>${this.scheduleLanguage.confirmContent1}</span>`,
                        nzOkText: this.commonLanguage.cancel,
                        nzMaskClosable: false,
                        nzOnOk: () => {
                          // 点击取消 则姓名不合法 给出文字提示 姓名已存在 下一步按钮不可点击
                          observe.next({error: true, duplicateUsernameAdd: true});
                          observe.complete();
                        },
                        nzCancelText: this.commonLanguage.confirm,
                        nzOnCancel: () => {
                          // 点击确认按钮 默许用户当前行为 可点击下一步进行下面的操作
                          observe.next(null);
                          observe.complete();
                        }
                      });
                    });
                  } else {
                    return of(null);
                  }
                }
              } else {
                return of(null);
              }
            }),
            first()
          );
        } else {
          return of(null);
        }
      },
      asyncCode: 'duplicateUsernameAdd', msg: this.userLanguage.duplicateUsernameAdd
    };
  }

  /**
   * 验证手机号在用户列表的唯一性
   */
  private phoneNumberRule(): { asyncRule: AsyncValidatorFn, asyncCode: any, msg: string } {
    return {
      asyncRule: (control: FormControl) => {
        if (control.value) {
          // 检验手机号唯一性的参数条件 在用户列表数据中找到与当前输入的手机号相同的那条数据
          const data = new QueryConditionModel;
          data.filterConditions[0] = new FilterCondition('phoneNumber', OperatorEnum.eq, control.value);
          return control.valueChanges.pipe(
            distinctUntilChanged(),
            debounceTime(1000),
            mergeMap(() => this.$userForCommonService.verifyUserInfo(data)),
            mergeMap(res => {
              // 如果下一步中的立即创建用户为 是 则需要检测手机号在用户列表中的唯一性 并以弹窗的形式进行提醒
              if (this.userInfo.formStatus.getData('isCreate') === StatusChangeEnum.yes) {
                if (res.code === 0) {
                  if (res.data && res.data.length > 0) {
                    return Observable.create(observe => {
                      // 整个弹窗体
                      this.$modalService.confirm({
                        nzTitle: this.scheduleLanguage.isContinueOperation,
                        nzOkType: 'danger',
                        nzContent: `<span>${this.scheduleLanguage.confirmContent2}</span>`,
                        nzOkText: this.commonLanguage.cancel,
                        nzMaskClosable: false,
                        nzOnOk: () => {
                          // 点击取消按钮时 该手机号不合法 给出文字提示
                          observe.next({error: true, phoneNumberExistTips: true});
                          this.phoneNumberMsg = this.userLanguage.phoneNumberExistTips;
                          observe.complete();
                        },
                        nzCancelText: this.commonLanguage.confirm,
                        nzOnCancel: () => {
                          // 点击确认按钮 允许用户点击下一步 进行下面的操作
                          observe.next(null);
                          observe.complete();
                        }
                      });
                    });
                  } else {
                    return of(null);
                  }
                }
              } else {
                return of(null);
              }
            }),
            first()
          );
        } else {
          return of(null);
        }
      },
      asyncCode: 'phoneNumberExistTips', msg: this.userLanguage.phoneNumberExistTips
    };
  }
}

