import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {TableComponent} from '../../../../../shared-module/component/table/table.component';
import {CommonLanguageInterface} from '../../../../../../assets/i18n/common/common.language.interface';
import {ScheduleLanguageInterface} from '../../../../../../assets/i18n/schedule/schedule.language.interface';
import {PageModel} from '../../../../../shared-module/model/page.model';
import {TableConfigModel} from '../../../../../shared-module/model/table-config.model';
import {FilterCondition, QueryConditionModel, SortCondition} from '../../../../../shared-module/model/query-condition.model';
import {ResultModel} from '../../../../../shared-module/model/result.model';
import {TeamManageListModel} from '../../model/team-manage-list.model';
import {ResultCodeEnum} from '../../../../../shared-module/enum/result-code.enum';
import {NzI18nService} from 'ng-zorro-antd';
import {ScheduleApiService} from '../../service/schedule-api.service';
import {FiLinkModalService} from '../../../../../shared-module/service/filink-modal/filink-modal.service';
import {LanguageEnum} from '../../../../../shared-module/enum/language.enum';
import {TeamManagementConfig} from '../../config/team-management-config';
import {ListExportModel} from '../../../../../core-module/model/list-export.model';

/**
 * 班组名称选择器
 */
@Component({
  selector: 'app-team-name-selector',
  templateUrl: './team-name-selector.component.html',
  styleUrls: ['./team-name-selector.component.scss']
})
export class TeamNameSelectorComponent implements OnInit, OnDestroy {
  // 是否展示班组名称弹框
  @Input() isVisible: boolean = false;
  // 选中的班组成员，用于回显
  @Input() selectIds: string[] = [];
  // 选中的班组成员确定事件
  @Output() handleOkEvent: EventEmitter<TeamManageListModel[]> = new EventEmitter<TeamManageListModel[]>();
  // 弹框显示隐藏事件
  @Output() isVisibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  // 表格组件
  @ViewChild('tableTpl') private tableTpl: TableComponent;
  // 公共国际化
  public commonLanguage: CommonLanguageInterface;
  // 排班管理国际化
  public scheduleLanguage: ScheduleLanguageInterface;
  // 列表数据
  public dataSet: TeamManageListModel[] = [];
  // 列表分页
  public pageBean: PageModel = new PageModel();
  // 班组成员列表配置
  public tableConfig: TableConfigModel = new TableConfigModel();
  // 列表查询参数
  public queryCondition: QueryConditionModel = new QueryConditionModel();
  // 选中的班组名称详细信息
  public selectTeamNameList: TeamManageListModel[] = [];
  constructor(private $nzI18n: NzI18nService,
              private $scheduleService: ScheduleApiService,
              public $message: FiLinkModalService) { }

  ngOnInit() {
    this.commonLanguage = this.$nzI18n.getLocaleData(LanguageEnum.common);
    this.scheduleLanguage = this.$nzI18n.getLocaleData(LanguageEnum.schedule);
    this.initTeamNameTable();
    this.queryTeamList();
  }

  ngOnDestroy(): void {
    this.tableTpl = null;
  }

  /**
   * 点击确定按钮事件
   */
  handleOk() {
    this.handleOkEvent.emit(this.dataSet.filter(item => item.checked));
  }

  /**
   * 点击清空按钮事件
   */
  cleanUpPerson() {
    this.selectIds = [];
    this.selectTeamNameList = [];
    this.tableTpl.keepSelectedData.clear();
    this.tableTpl.updateSelectedData();
    this.tableTpl.checkStatus();
  }

  /**
   * 班组名称列表选择器分页
   * param event PageModel
   */
  public teamPageChange(event: PageModel): void {
    this.queryCondition.pageCondition.pageNum = event.pageIndex;
    this.queryCondition.pageCondition.pageSize = event.pageSize;
    this.queryTeamList();
  }

  /**
   * 获取班组列表数据
   */
  private queryTeamList(): void {
    this.tableConfig.isLoading = true;
    this.$scheduleService.queryListTeamByPage(this.queryCondition).subscribe((res: ResultModel<TeamManageListModel[]>) => {
      this.tableConfig.isLoading = false;
      if (res.code === ResultCodeEnum.success) {
        this.dataSet = res.data || [];
        this.pageBean.pageIndex = res.pageNum;
        this.pageBean.Total = res.totalCount;
        this.pageBean.pageSize = res.size;
        // 回显
        if (this.selectIds && this.selectIds.length) {
          this.selectTeamNameList = this.selectTeamNameList.filter(item => this.selectIds.includes(item.id));
        }
      } else {
        this.$message.error(res.msg);
      }
    }, () => {
      this.tableConfig.isLoading = false;
    });
  }

  /**
   * 初始化班组名称表格配置项
   */
  private initTeamNameTable() {
    this.tableConfig = {
      isDraggable: true,
      isLoading: false,
      showSizeChanger: true,
      showSearchSwitch: true,
      showPagination: true,
      // primaryKey: '17-1',
      scroll: {x: '1200px', y: '600px'},
      noAutoHeight: true,
      noIndex: true,
      keepSelected: true,
      selectedIdKey: 'id',
      columnConfig: TeamManagementConfig.initTeamManagementColumnConfig(this.commonLanguage, this.scheduleLanguage),
      bordered: false,
      showSearch: false,
      // 排序
      sort: (event: SortCondition) => {
        this.queryCondition.sortCondition.sortField = event.sortField;
        this.queryCondition.sortCondition.sortRule = event.sortRule;
        this.queryTeamList();
      },
      // 搜索
      handleSearch: (event: FilterCondition[]) => {
        this.queryCondition.pageCondition.pageNum = 1;
        this.queryCondition.filterConditions = event;
        this.queryTeamList();
      },
    };
  }
}
