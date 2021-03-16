import {WisdomPointInfoModel} from './wisdom-point-info.model';

export class PlanPointModel {
  /**
   * 规划点的中心点
   */
  point: PointPositionModel;

  /**
   * 规划点位集合
   */
  pointList?: WisdomPointInfoModel[];

  /**
   * 规划点位集合
   */
  pointInfoList?: WisdomPointInfoModel[];
}

export class PointPositionModel {
  /**
   * 规划id
   */
  planId: string;

  /**
   * 坐标
   */
  xposition: string;
  yposition: string;
}
