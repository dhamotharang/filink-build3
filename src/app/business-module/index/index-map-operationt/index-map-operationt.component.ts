import {Component, Input, OnInit} from '@angular/core';
import {OperationService} from '../../../shared-module/service/index/operation.service';
import {ViewEnum} from '../../../core-module/enum/index/index.enum';

@Component({
  selector: 'app-index-map-operationt',
  templateUrl: './index-map-operationt.component.html',
  styleUrls: ['./index-map-operationt.component.scss']
})
export class IndexMapOperationtComponent implements OnInit {
  // 分组权限
  @Input() roleSelect: boolean;
  // 视图类型
  @Input() viewIndex: string;

  // 运维视图
  public maintenanceView = ViewEnum.maintenanceView;

  constructor(
    public $OperationService: OperationService
  ) {
  }

  public ngOnInit(): void {
  }

  public facilityLayeredChange(): void {
    this.$OperationService.eventEmit.emit({facility: false});
  }

  public selectGroupChange(): void {
    this.$OperationService.eventEmit.emit({selectGroup: false});
  }

  public adjustCoordinatesChange(): void {
    this.$OperationService.eventEmit.emit({addCoordinates: false});
  }
}
