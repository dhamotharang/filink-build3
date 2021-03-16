import {Component, Input, OnInit} from '@angular/core';
import {ChartUtil} from '../../util/chart-util';
import {AlarmLanguageInterface} from '../../../../assets/i18n/alarm/alarm-language.interface';
import {NzI18nService} from 'ng-zorro-antd';
import {LanguageEnum} from '../../enum/language.enum';
import {ResultModel} from '../../model/result.model';
import {AlarmForCommonService} from '../../../core-module/api-service/alarm';
import {AlarmSuggestModel} from '../../../core-module/model/alarm/alarm-suggest.model';

/**
 * 运维建议
 */
@Component({
  selector: 'app-trouble-suggest',
  templateUrl: './trouble-suggest.component.html',
  styleUrls: ['./trouble-suggest.component.scss']
})
export class TroubleSuggestComponent implements OnInit {
  // 标题
  @Input() showTitle;
  // 告警国际化引用
  public language: AlarmLanguageInterface;
  // 故障容器
  public troubleList: Array<AlarmSuggestModel> = [];
  // 环形图配置
  public ringChartOption: any;
  // 故障原因统计报表显示的类型  chart 图表   text 文字
  errorReasonStatisticsChartType;   // 故障原因统计报表显示的类型  chart 图表   text 文字
  // 选择索引
  public selectIndex: number = 0;

  constructor(
    private $nzI18n: NzI18nService,
    private $alarmForCommonService: AlarmForCommonService,
  ) {
    this.language = this.$nzI18n.getLocaleData(LanguageEnum.alarm);
  }

  /**
   * 初始化
   */
  ngOnInit() {
    this.getSuggest();
  }

  /**
   * 获取告警建议
   */
  getSuggest() {
    this.$alarmForCommonService.queryExperienceInfo().subscribe((result: ResultModel<AlarmSuggestModel[]>) => {
      if (result.code === 0) {
        this.troubleList = result.data;
        // echart 数据
        const chartData = result.data.map(item => ({
          value: item.percentage,
          name: item.breakdownReason,
        }));
        this.errorReasonStatisticsChartType = 'chart';
        this.ringChartOption = ChartUtil.setTroubleRingChartOption(chartData);
      }
    });
  }

  /**
   * 获取分析名称
   */
  public changeIndex(v): void {
    this.selectIndex = v;
  }
}
