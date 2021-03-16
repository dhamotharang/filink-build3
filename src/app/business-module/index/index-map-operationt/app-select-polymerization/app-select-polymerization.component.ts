import {Component, OnInit} from '@angular/core';
import {SelectGroupService} from '../../../../shared-module/service/index/select-group.service';
import {SelectPolymerizationService} from '../../../../shared-module/service/index/selectPolymerizationService';

@Component({
  selector: 'app-app-select-polymerization',
  templateUrl: './app-select-polymerization.component.html',
  styleUrls: ['./app-select-polymerization.component.scss']
})
export class AppSelectPolymerizationComponent implements OnInit {

  // 显示开关
  public showPolymerization: boolean = false;

  // 聚合方式
  public polymerizationValue: string = 'maintenance';


  constructor(
    private $selectPolymerizationService: SelectPolymerizationService,
  ) {
  }

  ngOnInit() {
  }

  public polymerizationShow() {
    this.showPolymerization = !this.showPolymerization;
  }

  public selectPolymerization(value) {
    console.log(value);
    // 运维试图聚合方式回传
    this.$selectPolymerizationService.eventEmit.emit({polymerizationValue: value});
  }

}
