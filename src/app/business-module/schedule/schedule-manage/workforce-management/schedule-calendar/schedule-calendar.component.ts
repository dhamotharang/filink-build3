import {Component, OnInit, ViewChild, ChangeDetectorRef, Input, Output, EventEmitter, AfterViewInit} from '@angular/core';
import {CommonLanguageInterface} from '../../../../../../assets/i18n/common/common.language.interface';
import {NzI18nService, NzCalendarComponent} from 'ng-zorro-antd';
import {LanguageEnum} from '../../../../../shared-module/enum/language.enum';
import {PageModel} from '../../../../../shared-module/model/page.model';
import {TableConfigModel} from '../../../../../shared-module/model/table-config.model';
import {FacilityForCommonUtil} from '../../../../../core-module/business-util/facility/facility-for-common.util';
import {FilterCondition, QueryConditionModel, SortCondition} from '../../../../../shared-module/model/query-condition.model';
import {CommonUtil} from '../../../../../shared-module/util/common-util';
import {TableComponent} from '../../../../../shared-module/component/table/table.component';
import {ScheduleLanguageInterface} from '../../../../../../assets/i18n/schedule/schedule.language.interface';
import {differenceInCalendarDays} from 'date-fns';

@Component({
  selector: 'app-schedule-calendar',
  templateUrl: './schedule-calendar.component.html',
  styleUrls: ['./schedule-calendar.component.scss']
})
export class ScheduleCalendarComponent implements OnInit {
  // 是否展示人员搜索输入框
  @Input() isShowSearch = false;
  // 是否展示自动排班按钮 && 是否可以自动排班和手动排班，为false时 只能查看排班，不能手动或自动排班
  @Input() isShowAutoScueduleBtn = false;
  // 传入的要排班的开始日期和结束日期
  @Input() dateRange: string[] = [];
  // 排班的人员数据
  @Input() scheduleMemberDataList =  [];
  // 已经排班的日期
  @Input() scheduledDateList: Date[] = [];
  // 选择的班组名称id集合，根据该字段获取成员列表
  @Input() teamIdList: string[] = [];
  // 查看排班的表格和日历的切换
  @Output() switchTableAndCalender = new EventEmitter();
  // 班组成员表格选择器
  @ViewChild('teamTableComponent') teamTableComponent: TableComponent;
  // 日历选择器
  @ViewChild('calendarComponent') calendarComponent: NzCalendarComponent;
  // 公共国际化
  public commonLanguage: CommonLanguageInterface;
  // 排班管理国际化
  public scheduleLanguage: ScheduleLanguageInterface;
  // 当前选中的日期
  public selectDate: Date = null;
  // 搜索人员时选中的人员所排班的日期
  public searchMemberDate = [];
  // 搜索人员姓名的值
  public memberValue: string = '';
  // 是否展示班组选择器弹框
  public isShowPersonModal: boolean = false;
  // 选择的班组成员id集合
  public selectTeamMemberIds: string[] = [];

  constructor(private $nzI18n: NzI18nService,
              private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.commonLanguage = this.$nzI18n.getLocaleData(LanguageEnum.common);
    this.scheduleLanguage = this.$nzI18n.getLocaleData(LanguageEnum.schedule);
  }

  /**
   * 人员搜索事件
   */
  public memberSearch() {
    // 根据输入的人员名称 高亮含有该人员的日期格
    if (this.memberValue && this.scheduleMemberDataList.length) {
      this.searchMemberDate = this.scheduleMemberDataList.filter(item => item.personName.includes(this.memberValue)).map(item => CommonUtil.dateFmt('yyyy-MM-dd', item.scheduleDate));
      this.selectDate = new Date(this.searchMemberDate[0]);
    } else {
      this.searchMemberDate = [];
    }
  }

  /**
   * 判断是否为选中的日期，是则添加选中后的样式
   * param currentDate
   */
  public isSelectDate(currentDate) {
    return this.searchMemberDate.some(item => item === CommonUtil.dateFmt('yyyy-MM-dd', currentDate));
  }

  /**
   * 日期格是否置灰
   * 不在选择的排班日期前后的时间置灰
   * param date
   */
  public isDisable(date) {
    if (!this.isShowAutoScueduleBtn) {
      return false;
    }
    if (this.dateRange && this.dateRange.length) {
      return differenceInCalendarDays(date, new Date(this.dateRange[0])) < 0 || differenceInCalendarDays(date, new Date(this.dateRange[1])) > 0;
    }
  }

  /**
   * 点击日期格子事件
   * param date
   */
  public dateCellClick(date) {
    // 不是手动排班的情况，日期格不能点击
    if (!this.isShowAutoScueduleBtn) {
      return;
    }
    // 置灰的日期格子不能点击
    if (this.isDisable(date)) {
      return;
    }
    this.selectDate = new Date(date);
    // 找到当前日期格子排班的人员，在班组成员列表中回显
    const currentSelectMember = this.scheduleMemberDataList.filter(item => CommonUtil.dateFmt('yyyy-MM-dd', item.scheduleDate) === CommonUtil.dateFmt('yyyy-MM-dd', this.selectDate));
    this.selectTeamMemberIds = currentSelectMember.map(item => item.id);
    this.isShowPersonModal = true;
  }

  /**
   * 自动排班事件
   */
  autoSchedule() {
    console.log(this.scheduledDateList);
    // todo 调自动排班接口
    for (let i = 4; i <= 58 ; i++) {
      let scheduleDate;
      if (i <= 28) {
        scheduleDate = new Date(`2021-02-${i}`);
      } else {
        scheduleDate = new Date(`2021-03-${i - 28}`);
      }
      const personName = `张三${i}`;
      const userId = i;
      if (!this.scheduledDateList.some(item => CommonUtil.dateFmt('yyyy-MM-dd', item) === CommonUtil.dateFmt('yyyy-MM-dd', scheduleDate))) {
        if (i % 2 === 0) {
          this.scheduleMemberDataList.push({personName: `李四${i}`, userId: i + 50, scheduleDate});
          this.scheduleMemberDataList.push({personName: `王五${i}`, userId: i + 50, scheduleDate});
        }
        this.scheduleMemberDataList.push({personName, userId, scheduleDate});
      }
    }
    this.scheduledDateList.push(...this.scheduleMemberDataList.map(item => item.scheduleDate));
    this.scheduledDateList = Array.from(new Set(this.scheduledDateList));
  }

  /**
   * 选择班组成员确定事件
   */
  public handlePersonOk(members) {
    if (members.length) {
      members = members.map(item => {
        // 给选中的成员加上当前日期
        return Object.assign({}, item, {scheduleDate: this.selectDate});
      });
      // 将已排班的日期加入到数组中并去重
      this.scheduledDateList.push(this.selectDate);
      this.scheduledDateList = Array.from(new Set(this.scheduledDateList));
    } else {
      // 未选择成员时则删除已加入到数组中的该日期
      this.scheduledDateList = this.scheduledDateList.filter(item => item !== this.selectDate);
    }
    // 替换当前日期的成员为此时选择的成员
    this.scheduleMemberDataList = this.scheduleMemberDataList.filter(item => CommonUtil.dateFmt('yyyy-MM-dd', item.scheduleDate) !== CommonUtil.dateFmt('yyyy-MM-dd', this.selectDate));
    this.scheduleMemberDataList.push(...members);
    this.isShowPersonModal = false;
  }

  /**
   * 在对应的日期格中展示对应的排班人员
   * param currentDate
   * param memberScheduleDate
   */
  public isShowMember(currentDate: Date, memberScheduleDate: Date) {
    return CommonUtil.dateFmt('yyyy-MM-dd', currentDate) === CommonUtil.dateFmt('yyyy-MM-dd', memberScheduleDate);
  }
}
