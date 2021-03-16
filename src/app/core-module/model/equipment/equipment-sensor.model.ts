/**
 * 设备传敢值数据模型
 */
export class EquipmentSensorModel {
  /**
   * id
   */
  public id: string;
  /**
   *  名称
   */
  public name: string;
  /**
   * 单位
   */
  public unit: string = '';
  /**
   * 图标
   */
  public icon: string;
  /**
   * 值
   */
  public statusValue: string = '';
}
