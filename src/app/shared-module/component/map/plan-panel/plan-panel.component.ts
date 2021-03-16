import {Component, Input, OnInit} from '@angular/core';
import {ViewEnum} from '../../../../core-module/enum/index/index.enum';

@Component({
  selector: 'app-plan-panel',
  templateUrl: './plan-panel.component.html',
  styleUrls: ['./plan-panel.component.scss']
})
export class PlanPanelComponent implements OnInit {
  @Input() infoData;
  @Input() viewIndex;
  // 项目视图
  public projectView = ViewEnum.projectView;
  // 规划视图
  public planView = ViewEnum.planView;
  constructor() { }

  ngOnInit() {
  }

}
