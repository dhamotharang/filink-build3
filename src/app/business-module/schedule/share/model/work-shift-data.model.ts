/**
 * 班次数据模型
 */
export class WorkShiftDataModel {
  /**
   * 主键id
   */
  id: string;
  /**
   * 班次名称
   */
  shiftName: string;
  /**
   * 班次类型
   */
  shiftType: string;
  /**
   * 开始时间
   */
  startTime: string;
  /**
   * 结束时间
   */
  endTime: string;
  /**
   * 备注
   */
  remark: string;
}
