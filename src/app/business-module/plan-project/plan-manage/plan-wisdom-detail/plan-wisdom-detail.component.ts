import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {FormItem} from '../../../../shared-module/component/form/form-config';
import {FormOperate} from '../../../../shared-module/component/form/form-operate.service';
import {CommonLanguageInterface} from '../../../../../assets/i18n/common/common.language.interface';
import {ActivatedRoute, Router} from '@angular/router';
import {NzI18nService} from 'ng-zorro-antd';
import {LanguageEnum} from '../../../../shared-module/enum/language.enum';
import {PlanProjectLanguageInterface} from '../../../../../assets/i18n/plan-project/plan-project.language.interface';
import {RuleUtil} from '../../../../shared-module/util/rule-util';
import {PlanApiService} from '../../share/service/plan-api.service';
import {ResultModel} from '../../../../shared-module/model/result.model';
import {ResultCodeEnum} from '../../../../shared-module/enum/result-code.enum';
import {FiLinkModalService} from '../../../../shared-module/service/filink-modal/filink-modal.service';
import {TreeSelectorConfigModel} from '../../../../shared-module/model/tree-selector-config.model';
import {FacilityForCommonUtil} from '../../../../core-module/business-util/facility/facility-for-common.util';
import {AreaModel} from '../../../../core-module/model/facility/area.model';
import {FacilityForCommonService} from '../../../../core-module/api-service/facility';
import {WisdomPointInfoModel} from '../../share/model/wisdom-point-info.model';
import {CommonUtil} from '../../../../shared-module/util/common-util';
import {PointStatusEnum} from '../../share/enum/point-status.enum';

/**
 * 编辑智慧杆
 */
@Component({
  selector: 'app-plan-wisdom-detail',
  templateUrl: './plan-wisdom-detail.component.html',
  styleUrls: ['./plan-wisdom-detail.component.scss']
})
export class PlanWisdomDetailComponent implements OnInit {
  // 区域选择器模板
  @ViewChild('areaSelector') areaSelector: TemplateRef<any>;
  // 页面是否加载
  public pageLoading = true;
  // 页面标题
  public pageTitle: string = '';
  // 表单配置
  public formColumn: FormItem[] = [];
  // 是否加载
  public isLoading = false;
  // 表单状态
  public formStatus: FormOperate;
  // 表单校验
  public isDisabled: boolean;
  // 公共国际化
  public commonLanguage: CommonLanguageInterface;
  // 规划语言包
  public language: PlanProjectLanguageInterface;
  // 区域选择器显示隐藏
  public areaSelectVisible: boolean = false;
  // 区域选择器树配置
  public areaSelectorConfig: any = new TreeSelectorConfigModel();
  public areaNodes: any[] = [];
  public pointInfo: WisdomPointInfoModel = new WisdomPointInfoModel;

  constructor(private $router: Router,
              private $nzI18n: NzI18nService,
              private $active: ActivatedRoute,
              private $message: FiLinkModalService,
              private $ruleUtil: RuleUtil,
              private $facilityCommonService: FacilityForCommonService,
              private $planApiService: PlanApiService) {
  }

  ngOnInit() {
    this.language = this.$nzI18n.getLocaleData(LanguageEnum.planProject);
    this.pageTitle = this.language.updateWisdom;
    this.commonLanguage = this.$nzI18n.getLocaleData(LanguageEnum.common);

    this.getAreaData();
    this.pointInfo.pointId = this.$active.snapshot.queryParams.id;
    this.selectAllPointModel().then((modelList: any[]) => {
      const pointModelList = modelList.map(item => {
        return {label: item, code: item};
      });
      this.initFormColumn(pointModelList);
      this.queryPlanPointById(this.pointInfo.pointId);
    });
  }

  /**
   * 获取表单实例
   */
  public formInstance(event: { instance: FormOperate }): void {
    this.formStatus = event.instance;
    this.formStatus.group.statusChanges.subscribe(() => {
      this.isDisabled = this.formStatus.getValid();
    });
  }

  public showAreaSelector() {
    this.areaSelectVisible = true;
    FacilityForCommonUtil.setAreaNodesStatusUnlimited(this.areaNodes, this.pointInfo.areaCode, null, 'areaCode');
    this.areaSelectorConfig.treeNodes = this.areaNodes;
  }

  /**
   * 区域选中结果
   * param event
   */
  public areaSelectChange(event: AreaModel): void {
    if (event[0]) {
      this.pointInfo.areaCode = event[0].areaCode;
      this.pointInfo.areaName = event[0].areaName;
    } else {
      this.pointInfo.areaCode = null;
      this.pointInfo.areaName = '';
    }
  }

  /**
   * 保存规划
   */
  public save(): void {
    const body = this.formStatus.getRealData();
    body.pointId = this.pointInfo.pointId;
    body.areaCode = this.pointInfo.areaCode;
    body.areaName = this.pointInfo.areaName;
    this.$planApiService.updatePlanPoint(body).subscribe((result: ResultModel<string>) => {
      this.isLoading = false;
      if (result.code === ResultCodeEnum.success) {
        this.$message.error(this.language.editPlanPointSuccess);
        this.goBack();
      } else {
        this.$message.error(result.msg);
      }
    }, () => {
      this.isLoading = false;
    });
  }

  /**
   * 返回
   */
  public goBack(): void {
    this.$router.navigateByUrl(`business/plan-project/plan-wisdom-list`).then();
  }

  /**
   * 获取区域数据
   */
  public getAreaData(): void {
    this.$facilityCommonService.queryAreaList().subscribe((res: ResultModel<AreaModel[]>) => {
      if (res.code === ResultCodeEnum.success) {
        this.areaNodes = res.data || [];
        this.initAreaSelectorConfig(this.areaNodes);
      }
    });
  }

  /**
   * 初始化表单配置
   */
  private initFormColumn(pointModelList: any[]): void {
    this.formColumn = [
      { // 智慧杆名称
        label: this.language.wisdomName,
        key: 'pointName',
        type: 'input',
        col: 24,
        require: true,
        rule: [{required: true}, RuleUtil.getNameMaxLengthRule(255)],
        asyncRules: [
          this.$ruleUtil.getNameAsyncRule(value => this.$planApiService.checkPlanPointName(
            {pointId: this.pointInfo.pointId, pointNameList: [value]}),
            res => res.code === ResultCodeEnum.success && res.data && !res.data.length)
        ],
        customRules: [],
      },
      { // 所属区域
        label: this.language.BelongsAreaName,
        key: 'areaCode',
        type: 'custom',
        template: this.areaSelector,
        col: 24,
        rule: [RuleUtil.getNameMaxLengthRule(255)],
        customRules: [],
      },
      { // 智慧杆型号
        label: this.language.wisdomModel,
        key: 'pointModel',
        type: 'select',
        selectInfo: {
          data: pointModelList,
          label: 'label',
          value: 'code'
        },
        col: 24,
        require: true,
        rule: [{required: true}],
        customRules: [],
      },
      { // 智慧杆状态
        label: this.language.status,
        key: 'pointStatus',
        type: 'select',
        selectInfo: {
          data: CommonUtil.codeTranslate(PointStatusEnum, this.$nzI18n, null, LanguageEnum.planProject),
          label: 'label',
          value: 'code'
        },
        col: 24,
        require: true,
        disabled: true,
        rule: [{required: true}],
        customRules: [],
      },
      { // 所属规划
        label: this.language.planId,
        key: 'planName',
        type: 'input',
        col: 24,
        disabled: true,
        require: true,
        rule: [{required: true}],
        customRules: [],
      }
    ];
  }

  /**
   * 初始化选择区域配置
   * param nodes
   */
  private initAreaSelectorConfig(nodes): void {
    this.areaSelectorConfig = {
      width: '500px',
      height: '300px',
      title: `${this.commonLanguage.select}${this.language.area}`,
      treeSetting: {
        check: {
          enable: true,
          chkStyle: 'radio',
          radioType: 'all'
        },
        data: {
          simpleData: {
            enable: true,
            idKey: 'areaCode',
          },
          key: {
            name: 'areaName'
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
   * 根据id 查询规划点位
   * param id
   */
  private queryPlanPointById(id) {
    this.$planApiService.queryPlanPointById(id).subscribe((result: ResultModel<WisdomPointInfoModel>) => {
      this.pageLoading = false;
      if (result.code === ResultCodeEnum.success) {
        this.pointInfo = result.data;
        this.formStatus.resetData(result.data);
      }
    }, () => {
      this.pageLoading = false;
    });
  }

  /**
   * 查询所有的智慧杆型号
   * param id
   */
  private selectAllPointModel(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.$planApiService.selectAllPointModel().subscribe((result: ResultModel<any>) => {
        if (result.code === ResultCodeEnum.success) {
          resolve(result.data);
        }
      });
    });
  }
}
