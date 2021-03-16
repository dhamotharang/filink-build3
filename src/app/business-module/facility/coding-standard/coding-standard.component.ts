import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {FacilityLanguageInterface} from '../../../../assets/i18n/facility/facility.language.interface';
import {NzI18nService} from 'ng-zorro-antd';
import {CodingStandardApiService} from '../share/service/coding-standard/coding-standard-api.service';
import {LanguageEnum} from '../../../shared-module/enum/language.enum';
import {PageModel} from '../../../shared-module/model/page.model';
import {TableConfigModel} from '../../../shared-module/model/table-config.model';
import {FilterCondition, QueryConditionModel, SortCondition} from '../../../shared-module/model/query-condition.model';
import {ResultModel} from '../../../shared-module/model/result.model';
import {ResultCodeEnum} from '../../../shared-module/enum/result-code.enum';
import {TableComponent} from '../../../shared-module/component/table/table.component';
import {CodingStandardEnum} from '../share/enum/coding-standard.enum';
import {FiLinkModalService} from '../../../shared-module/service/filink-modal/filink-modal.service';

@Component({
  selector: 'app-coding-standard',
  templateUrl: './coding-standard.component.html',
  styleUrls: ['./coding-standard.component.scss']
})
export class CodingStandardComponent implements OnInit {
  // 启用状态
  @ViewChild('enableStatus') enableStatus: TemplateRef<any>;
  // 表格
  @ViewChild('codingTableList') private codingTableList: TableComponent;
  // 设施语言包
  public language: FacilityLanguageInterface;
  // 列表数据
  public dataSet = [];
  // 列表分页实体
  public pageBean: PageModel = new PageModel();
  // 列表配置
  public tableConfig: TableConfigModel = new TableConfigModel();
  // 列表查询条件
  public queryCondition: QueryConditionModel = new QueryConditionModel();
  // 是否展示查看可选字段弹窗
  public isShow: boolean = false;
  // 可选字段集
  public fieldList: string[] = [];

  constructor(
    public $nzI18n: NzI18nService,
    public $CodingStandardApiService: CodingStandardApiService,
    public $message: FiLinkModalService,
    private $router: Router
  ) {
  }

  ngOnInit() {
    // 国际化
    this.language = this.$nzI18n.getLocaleData(LanguageEnum.facility);
    this.initTableConfig();
    this.codingRuleListByPage();
  }

  /**
   * 分页查询
   * @param event PageModel
   */
  public pageChange(event: PageModel): void {
    this.queryCondition.pageCondition.pageNum = event.pageIndex;
    this.queryCondition.pageCondition.pageSize = event.pageSize;
    // this.refreshData();
  }

  /**
   * 监听switch开关事件
   * @ param event
   */
  public switchChange(event): void {
    this.dataSet.forEach(item => {
      if (event.codingRuleId === item.codingRuleId) {
        item.switchLoading = true;
      }
    });
    const body = {
      codingRuleIds: [event.codingRuleId]
    };
    // 状态由禁用状态变为启用状态
    if (!event.codingRuleStatus) {
      this.enableCodingRule(body, event.codingRuleStatus);
    } else {
      // 状态由启用状态变为禁用状态
      this.disableCodingRule(body, event.codingRuleStatus);
    }
  }

  /**
   * 关闭查看可选字段弹窗
   */
  public handleCancel(): void {
    this.isShow = false;

  }

  // 查询查询编码标准列表
  private codingRuleListByPage(): void {
    this.queryCondition.bizCondition = {
      codingRuleName: '',
      codingRuleContent: '',
      maxLength: '',
      codingRuleStatus: '',
      remark: '',
      codingRuleType: ''
    };
    this.tableConfig.isLoading = true;
    this.$CodingStandardApiService.codingRuleListByPage(this.queryCondition).subscribe((result: ResultModel<any>) => {
      if (result.code === ResultCodeEnum.success) {
        this.tableConfig.isLoading = false;
        this.dataSet = result.data || [];
        this.dataSet.forEach(item => {
          item.codingRuleStatus = item.codingRuleStatus === CodingStandardEnum.enable;
          item.switchLoading = false;
        });
        this.pageBean.Total = result.totalCount;
        this.pageBean.pageIndex = result.pageNum;
        this.pageBean.pageSize = result.size;
      }
    }, () => {
      this.tableConfig.isLoading = false;
    });
}

  /**
   * 获取编码标准可选字段
   */
  private queryCodingRuleField(): void {
    this.isShow = true;
    this.$CodingStandardApiService.queryCodingRuleField().subscribe((result: ResultModel<any>) => {
      if (result.code === ResultCodeEnum.success) {
        const arr = [];
        result.data.forEach(item => {
          arr.push(item.fieldName);
        });
        this.fieldList = arr;
        console.log(this.fieldList);
      } else {
        this.$message.error(result.msg);
      }
    }, () => {
    });
  }

  /**
   * 编码标准删除
   */
  private deleteCodingRule(ids): void {
    this.tableConfig.isLoading = true;
    this.$CodingStandardApiService.deleteCodingRule(ids).subscribe((result: ResultModel<any>) => {
      if (result.code === ResultCodeEnum.success) {
        this.tableConfig.isLoading = false;
        this.$message.success(this.language.codingStandard.deleteCodingStandardSuccess);
      } else {
        this.$message.error(result.msg);
      }
    }, () => {
      this.tableConfig.isLoading = false;
    });
  }

  /**
   * 编码标准禁用
   */
  private disableCodingRule(body, status: boolean): void {
    this.$CodingStandardApiService.disableCodingRule(body).subscribe((result: ResultModel<any>) => {
      if (result.code === ResultCodeEnum.success) {
        this.isChangeStatus(body, false, !status);
      } else {
        this.$message.error(result.msg);
        this.isChangeStatus(body, false, status);
      }
    }, () => {
      this.isChangeStatus(body, false, status);
    });
  }

  /**
   * 编码标准启用
   */
  private enableCodingRule(body, status: boolean): void {
    this.$CodingStandardApiService.enableCodingRule(body).subscribe((result: ResultModel<any>) => {
      if (result.code === ResultCodeEnum.success) {
        this.isChangeStatus(body, false, !status);
      } else {
        this.$message.error(result.msg);
        this.isChangeStatus(body, false, status);
      }
    }, () => {
      this.isChangeStatus(body, false, status);
    });
  }

  /**
   * 启用禁用调接口成功后，改变按钮状态，否则不变
   */
  private isChangeStatus(body, isLoading: boolean, isChangeStatus): void {
    this.dataSet.forEach(item => {
      if (body.codingRuleIds[0] === item.codingRuleId) {
        item.switchLoading = isLoading;
        item.codingRuleStatus = isChangeStatus;
      }
    });
  }

  /**
   * 初始化表格配置
   */
  private initTableConfig(): void {
    this.tableConfig = {
      isDraggable: true,
      isLoading: false,
      outHeight: 108,
      keepSelected: true,
      selectedIdKey: 'codingRuleId',
      showSizeChanger: true,
      showSearchSwitch: false,
      scroll: {x: '1804px', y: '340px'},
      noIndex: true,
      showSearchExport: false,
      notShowPrint: true,
      columnConfig: [
        {type: 'select', fixedStyle: {fixedLeft: true, style: {left: '0px'}}, width: 62},
        {
          type: 'serial-number', width: 62, title: this.language.serialNumber,
          fixedStyle: {fixedLeft: true, style: {left: '62px'}}
        },
        { // 名称
          title: this.language.codingStandard.codingName, key: 'codingRuleName', width: 150,
          fixedStyle: {fixedLeft: true, style: {left: '124px'}},
          isShowSort: true,
        },
        { // 编码内容
          title: this.language.codingStandard.codingContent, key: 'codingRuleContent', width: 150,
          isShowSort: true,
        },
        { // 最大编码长度
          title: this.language.codingStandard.maxEncodingLength, key: 'maxLength', width: 150,
          isShowSort: true,
        },
        // 启用状态
        {
          title: this.language.codingStandard.enabledState,
          key: 'codingRuleStatus',
          width: 100,
          isShowSort: true,
          type: 'render',
          renderTemplate: this.enableStatus,
        },
        { // 备注
          title: this.language.remarks, key: 'remark',
          isShowSort: true,
          width: 150,
        },
        {
          title: this.language.operate, searchable: true,
          searchConfig: {type: 'operate'}, key: '', width: 150, fixedStyle: {fixedRight: true, style: {right: '0px'}}
        },
      ],
      showPagination: true,
      bordered: false,
      showSearch: false,
      topButtons: [
        {
          // 新增编码标准
          text: this.language.addArea,
          iconClassName: 'fiLink-add-no-circle',
          // permissionCode: '03-1-2',
          handle: () => {
            this.addCodingStandard();
          }
        },
        {
          // 查看可选字段
          text: this.language.codingStandard.queryOptionalFields,
          iconClassName: 'fiLink-optional-field',
          // permissionCode: '03-1-2',
          handle: () => {
            this.queryCodingRuleField();
          }
        },
        {
          // 删除编码标准
          text: this.language.deleteHandle,
          btnType: 'danger',
          className: 'table-top-delete-btn',
          iconClassName: 'fiLink-delete',
          permissionCode: '03-1-4',
          needConfirm: true,
          canDisabled: true,
          confirmContent: this.language.deleteFacilityMsg,
          handle: (data) => {
            const arr = [];
            data.forEach(item => {
              arr.push(item.codingRuleId);
            });
            const ids = {codingRuleIds: arr};
            this.deleteCodingRule(ids);
          }
        },
      ],
      operation: [
        // 编辑
        {
          text: this.language.codingStandard.codingEdit,
          className: 'fiLink-edit',
          // permissionCode: this.primaryKey.primaryEditKey,
          handle: (data) => {
            this.navigateToDetail('business/facility/coding-detail/update',
              {queryParams: {id: data.codingRuleId}});
          }
        },
        // 编码范围
        {
          text: this.language.codingStandard.codingRange,
          className: 'fiLink-filink-celuexiafa-icon',
          needConfirm: true,
          // permissionCode: this.primaryKey.primaryIssueKey,
          handle: (data) => {
          }
        },
        // 删除
        {
          text: this.language.deleteHandle,
          className: 'fiLink-delete red-icon',
          needConfirm: true,
          // permissionCode: this.primaryKey.primaryDeleteKey,
          // confirmContent: `${this.languageTable.strategyList.confirmDelete}?`,
          handle: (data) => {
            const ids = {codingRuleIds: [data.codingRuleId]};
            this.deleteCodingRule(ids);
          }
        }
      ],
      // 排序
      sort: (event: SortCondition) => {
        this.queryCondition.sortCondition.sortField = event.sortField;
        this.queryCondition.sortCondition.sortRule = event.sortRule;
        // this.refreshData();
      },
      // 搜索
      handleSearch: (event: FilterCondition[]) => {
        this.queryCondition.pageCondition.pageNum = 1;
        this.queryCondition.filterConditions = event;
        // this.refreshData();
      },
    };
  }

  /**
   * 跳转到新增编码标准页面
   */
  private addCodingStandard(): void {
    this.navigateToDetail(`business/facility/coding-detail/add`);
  }

  /**
   * 跳转到详情
   * param url
   */
  private navigateToDetail(url: string, extras = {}): void {
    this.$router.navigate([url], extras).then();
  }
}
