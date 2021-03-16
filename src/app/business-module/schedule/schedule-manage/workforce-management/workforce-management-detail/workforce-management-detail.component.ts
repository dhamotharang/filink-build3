import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {OperateTypeEnum} from '../../../../../shared-module/enum/page-operate-type.enum';
import {NzI18nService} from 'ng-zorro-antd';
import {FiLinkModalService} from '../../../../../shared-module/service/filink-modal/filink-modal.service';
import {ActivatedRoute, Router} from '@angular/router';
import {RuleUtil} from '../../../../../shared-module/util/rule-util';
import {ScheduleApiService} from '../../../share/service/schedule-api.service';
import { CommonLanguageInterface } from 'src/assets/i18n/common/common.language.interface';
import { ScheduleLanguageInterface } from 'src/assets/i18n/schedule/schedule.language.interface';
import {LanguageEnum} from '../../../../../shared-module/enum/language.enum';
import {FinalValueEnum} from '../../../../../core-module/enum/step-final-value.enum';
import { StepsModel } from 'src/app/core-module/enum/application-system/policy.enum';
import {FormItem} from '../../../../../shared-module/component/form/form-config';
import {FormOperate} from '../../../../../shared-module/component/form/form-operate.service';
import {ResultCodeEnum} from '../../../../../shared-module/enum/result-code.enum';
import {TreeSelectorConfigModel} from '../../../../../shared-module/model/tree-selector-config.model';
import {ResultModel} from '../../../../../shared-module/model/result.model';
import {AreaModel} from '../../../../../core-module/model/facility/area.model';
import {FacilityForCommonService} from '../../../../../core-module/api-service/facility';
import {FacilityForCommonUtil} from '../../../../../core-module/business-util/facility/facility-for-common.util';
import {TeamManageListModel} from '../../../share/model/team-manage-list.model';
import {CommonUtil} from '../../../../../shared-module/util/common-util';
import { ScheduleCalendarComponent } from '../schedule-calendar/schedule-calendar.component';
import { differenceInCalendarDays } from 'date-fns';

@Component({
  selector: 'app-workforce-management-detail',
  templateUrl: './workforce-management-detail.component.html',
  styleUrls: ['./workforce-management-detail.component.scss']
})
export class WorkforceManagementDetailComponent implements OnInit {
  // 开始日期模板
  @ViewChild('startDateTpl') startDateTpl: TemplateRef<HTMLDocument>;
  // 结束日期模板
  @ViewChild('endDateTpl') endDateTpl: TemplateRef<HTMLDocument>;
  // 班组名称模板
  @ViewChild('teamNameSelectorTpl') teamNameSelectorTpl: TemplateRef<HTMLDocument>;
  // 区域模板
  @ViewChild('areaSelectorTpl') areaSelectorTpl: TemplateRef<HTMLDocument>;
  // 排班日历组件
  @ViewChild('scheduleCalendar') scheduleCalendar: ScheduleCalendarComponent;
  // 页面标题
  public pageTitle: string = '';
  // 页面类型
  public pageType: string = OperateTypeEnum.add;
  // 公共国际化
  public commonLanguage: CommonLanguageInterface;
  // 国际化
  public scheduleLanguage: ScheduleLanguageInterface;
  // 选中的步骤数
  public isActiveSteps = FinalValueEnum.STEPS_FIRST;
  // 步骤条的步骤枚举
  public finalValueEnum = FinalValueEnum;
  // 步骤条配置
  public scheduleStepConfig: StepsModel[] = [];
  // 表单参数
  public formColumn: FormItem[] = [];
  // 表单状态
  public formInstance: FormOperate;
  // 排班开始日期
  public startDate: string;
  // 排班结束日期
  public endDate: string;
  // 排班人员数据
  public scheduleMemberDataList = [];
  // 已经排班的日期 防止点击上一步下一步后，日期格重复累加已排班的人员
  public scheduledDateList = [];
  // 班次名称下拉框选择项
  public shiftNameList = [];
  // 下一步按钮是否可点击
  public isNextStepDisabled: boolean = true;
  // 提交loading
  public isSaveLoading: boolean = false;
  // 确认按钮是否可以点击
  public isConfirmDisabled: boolean = true;
  // 保存基本信息
  public saveFirstStepInfo;
  // 班组名称 表单显示
  public teamNames: string = '';
  // 是否展示班组名称选择器
  public isShowTeamSelectorModal: boolean = false;
  // 区域名称 表单显示
  public areaNames: string = '';
  // 是否展示区域选择器
  public isShowAreaSelectorModal: boolean = false;
  // 区域选择器配置信息
  public areaSelectorConfig: TreeSelectorConfigModel = new TreeSelectorConfigModel();
  // 区域选择节点
  private areaNodes: AreaModel[] = [];
  // 编辑的排班id
  private scheduleId: string = '';
  // 选择的班组的部门id集合
  private deptIdsForTeam: string[] = [];
  constructor(public $nzI18n: NzI18nService,
              public $message: FiLinkModalService,
              private $router: Router,
              private $active: ActivatedRoute,
              private $ruleUtil: RuleUtil,
              private $facilityForCommonService: FacilityForCommonService,
              private $scheduleService: ScheduleApiService) { }

  ngOnInit() {
    this.scheduleLanguage = this.$nzI18n.getLocaleData(LanguageEnum.schedule);
    this.commonLanguage = this.$nzI18n.getLocaleData(LanguageEnum.common);
    this.scheduleStepConfig = [
      {number: FinalValueEnum.STEPS_FIRST, activeClass: ' active', title: this.scheduleLanguage.basicInformation},
      {number: FinalValueEnum.STEPS_SECOND, activeClass: '', title: this.scheduleLanguage.personSchedule},
      {number: FinalValueEnum.STEPS_THIRD, activeClass: '', title: this.scheduleLanguage.finish}];
    this.initForm();
    this.getPage();
    this.initAreaSelectorConfig();
  }

  /**
   * 选择班组名称确定事件
   */
  public handleTeamNameOk(members: TeamManageListModel[]) {
    this.formInstance.resetControlData('teamIdList', members.map(item => item.id));
    this.teamNames = members.map(item => item.teamName).join(',');
    this.isShowTeamSelectorModal = false;
    this.deptIdsForTeam = members.map(item => item.deptId);
  }

  /**
   * 打开区域选择器弹框
   */
  public showAreaSelectorModal() {
    // 选择班组名称后才能选择区域
    if (this.formInstance.getData('teamIdList') && this.formInstance.getData('teamIdList').length) {
      this.queryAreaNodeData(this.deptIdsForTeam);
    } else {
      this.$message.info(this.scheduleLanguage.selectTeamNameFirst);
    }
  }

  /**
   * 区域选择器确定事件
   * param event 选中的区域
   */
  public areaSelectChange(event: AreaModel[]): void {
    if (event && event.length) {
      FacilityForCommonUtil.setAreaNodesStatus(this.areaNodes, null, null);
      this.areaNames = event.map(item => item.areaName).join(',');
      this.formInstance.resetControlData('areaIdList', event.map(item => item.areaId));
    } else {
      FacilityForCommonUtil.setAreaNodesStatus(this.areaNodes, null);
      this.areaNames = '';
      this.formInstance.resetControlData('areaIdList', null);
    }
  }

  /**
   * 上一步
   * param val 当前步骤
   */
  public handPrevSteps(val: number): void {
    this.isActiveSteps = val - 1;
    this.scheduleStepConfig.forEach(item => {
      item.activeClass = item.number === this.isActiveSteps ? 'active' : '';
    });
  }

  /**
   * 下一步
   * param val 当前步骤
   */
  public handNextSteps(val: number): void {
    if (val === FinalValueEnum.STEPS_FIRST) {
      this.startDate = CommonUtil.dateFmt('yyyy-MM-dd', this.formInstance.getData('startDate'));
      this.endDate = CommonUtil.dateFmt('yyyy-MM-dd', this.formInstance.getData('endDate'));
    }
    if (val === FinalValueEnum.STEPS_SECOND) {
      if (this.scheduleCalendar.scheduleMemberDataList && this.scheduleCalendar.scheduleMemberDataList.length) {
        this.scheduleMemberDataList = this.scheduleCalendar.scheduleMemberDataList;
        this.scheduledDateList = this.scheduleCalendar.scheduledDateList;
      } else {
        this.$message.info(this.scheduleLanguage.schedulePeopleOperateTip);
        return;
      }
    }
    this.isActiveSteps = val + 1;
    this.scheduleStepConfig.forEach(item => {
      item.activeClass = item.number === this.isActiveSteps ? 'active' : '';
    });
  }

  /**
   * 点击确定按钮提交数据事件
   */
  public handStepsSubmit(): void {
    const params = this.formInstance.getRealData();
    this.$scheduleService.saveMaintenanceScheduleInfo(params).subscribe(res => {

    });
  }

  /**
   * 取消操作
   */
  public handCancelSteps(): void {
    window.history.go(-1);
  }

  /**
   * 表单实例校验
   */
  public scheduleFormInstance(event: { instance: FormOperate }): void {
    this.formInstance = event.instance;
    this.formInstance.group.statusChanges.subscribe(() => {
      this.isNextStepDisabled = !(this.formInstance.getRealValid());
    });
  }

  /**
   * 不可选中的开始日期
   * param current
   */
  public startDateDisabled = (current: Date): boolean => {
    return differenceInCalendarDays(current, new Date()) < 0;
  }

  /**
   * 不可选中的结束日期
   * param current
   */
  public endDateDisabled = (current: Date): boolean => {
    return differenceInCalendarDays(current, this.formInstance.getData('startDate')) < 0;
  }

  /**
   * 根据id查询排班信息
   */
  private queryScheduleInfoById() {
    this.$scheduleService.queryListScheduleById(this.scheduleId).subscribe(res => {
      if (res.code === ResultCodeEnum.success) {
        if (res.data) {
          this.formInstance.group.reset(res.data);
          if (res.data.teamVOList && res.data.teamVOList.length) {
            // 处理班组名称的数据
            this.formInstance.resetControlData('teamIdList', res.data.teamVOList.map(item => item.id));
            this.teamNames = res.data.teamVOList.map(item => item.teamName).join(',');
            this.deptIdsForTeam = res.data.teamVOList.map(item => item.deptId);
          }
          if (res.data.areaVOList && res.data.areaVOList.length) {
            // 处理区域数据
            this.areaNames = res.data.areaVOList.map(item => item.areaName).join(',');
            this.formInstance.resetControlData('areaIdList', res.data.areaVOList.map(item => item.areaId));
          }
        }
      }
    });
  }

  /**
   * 根据选择的班组的部门id查询区域选择器数据
   * params deptId 部门id
   */
  private queryAreaNodeData(deptId: string[]) {
    // 获取区域列表 todo 之后换成schedule服务中的查区域接口
    // this.$scheduleService.getIntersectionOfRegionsList(deptId).subscribe(res) => {
    this.$facilityForCommonService.queryAreaList().subscribe((res: ResultModel<AreaModel[]>) => {
      this.areaNodes = res.data || [];
      this.areaSelectorConfig.treeNodes = this.areaNodes;
      FacilityForCommonUtil.setAreaNodesStatus(this.areaNodes, null, null);
      // 如果有数据 就默认勾选
      if (this.formInstance.getData('areaIdList')) {
        this.isCheckData(this.areaNodes, this.formInstance.getData('areaIdList'));
      } else {
        this.handleTreeData(this.areaNodes);
      }
      this.isShowAreaSelectorModal = true;
    });
  }

  /**
   * 递归循环 勾选数据
   * param data
   * param ids
   */
  private isCheckData(data: AreaModel[], ids: string[]): void {
    ids.forEach( id => {
      data.forEach(item => {
        item.id = item.areaId;
        if ( id === item.areaId ) {
          item.checked = true;
        }
        if (item.children) {
          this.isCheckData(item.children, ids);
        }
      });
    });
  }

  /**
   * 处理树结构，添加id和value属性，转化为树组件需要的结构
   * param data
   */
  private handleTreeData(data: AreaModel[]): void {
    data.forEach(item => {
      item.id = item.areaId;
      item.value = item.areaId;
      if (item.children) {
        this.handleTreeData(item.children);
      }
    });
  }

  /**
   * 初始化表单信息
   */
  private initForm() {
    this.formColumn = [
      {
        // 开始日期
        label: this.scheduleLanguage.startDate,
        key: 'startDate',
        type: 'custom',
        width: 300,
        require: true,
        rule: [{required: true}],
        template: this.startDateTpl
      },
      {
        // 结束日期
        label: this.scheduleLanguage.endDate,
        key: 'endDate',
        type: 'custom',
        width: 300,
        require: true,
        rule: [{required: true}],
        template: this.endDateTpl
      },
      {
        // 班组名称
        label: this.scheduleLanguage.teamName,
        key: 'teamIdList',
        type: 'custom',
        width: 350,
        require: true,
        rule: [{required: true}],
        template: this.teamNameSelectorTpl
      },
      {
        // 班次名称
        label: this.scheduleLanguage.workShiftName,
        key: 'shiftId',
        type: 'select',
        col: 24,
        require: true,
        rule: [{required: true}],
        selectInfo: {
          // data: this.shiftNameList,
          data : [{label: 'ces', value: 'ces'}],
          label: 'label', value: 'value'
        }
      },
      {
        // 区域
        label: this.scheduleLanguage.area,
        key: 'areaIdList',
        type: 'custom',
        width: 350,
        require: true,
        rule: [{required: true}],
        template: this.areaSelectorTpl
      },
      {
        // 备注
        label: this.scheduleLanguage.remark,
        key: 'remark',
        type: 'textarea',
        col: 24,
        require: false,
        rule: [],
      },
    ];
  }

  /**
   * 初始化区域选择器配置
   * param nodes
   */
  private initAreaSelectorConfig(): void {
    this.areaSelectorConfig = {
      title: this.scheduleLanguage.area,
      width: '1000px',
      height: '300px',
      treeNodes: this.areaNodes,
      treeSetting: {
        check: {
          enable: true,
          chkStyle: 'checkbox',
          chkboxType: {'Y': 'ps', 'N': 'ps'}
        },
        data: {
          simpleData: {
            enable: false,
            idKey: 'areaId',
          },
          key: {
            name: 'areaName'
          },
        },
        view: {
          showIcon: false,
          showLine: false,
        },
      },
      onlyLeaves: false,
      selectedColumn: [
        {
          title: this.scheduleLanguage.areaName, key: 'areaName', width: 300,
        }
      ]
    };
  }

  /**
   * 获取页面显示
   */
  private getPage(): void {
    // 获取页面操作类型及标题
    this.pageType = this.$active.snapshot.params.type;
    this.pageTitle = this.pageType === OperateTypeEnum.update ? this.scheduleLanguage.updateScheduling : this.scheduleLanguage.addScheduling;
    if (this.pageType === OperateTypeEnum.update) {
      this.$active.queryParams.subscribe(params => {
        this.scheduleId = params.id;
        // 编辑数据回显
        this.queryScheduleInfoById();
      });
    }
  }
}
