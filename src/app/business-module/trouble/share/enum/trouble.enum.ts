/**
 * 指派类型
 */
export enum DesignateTypeEnum {
  // 初始指派
  initial = '0',
  // 责任上报
  duty = '1',
  // 上报分管领导
  reportResponsibleLeaders = '2',
  // 故障打回
  troubleRepulse = '3',
  // 协调成功
  coordinateSuccessful = '4',
  // 协调不成功强制指派
  coordinateFailConstraint = '5',
  // 协调不成功
  coordinateFail = '6',
}

/**
 * 指派原因
 */
export enum DesignateReasonEnum {
  // 初始指派
  initial = '0',
  // 指派错误，需重新指派
  againDesignate = '1',
  // 责任无法确定,需上级协调
  coordinate = '2',
  // 其他
  other = '3',
}

/**
 * 故障卡片切换，故障提示码
 */
export enum TroubleHintListEnum {
  // 故障级别
  troubleLevelCode = 1,
  // 故障设施类型
  troubleFacilityTypeCode = 2
}

/**
 * 是否展示责任单位
 */
export const IsShowUintEnum = {
  // 是
  yes: '0',
  // 否
  no: '1'
};

/**
 * 图片页签
 */
export enum ImageTabsEnum {
  // 工单执行前
  orderExecuteBefore = '1',
  // 工单执行后
  orderExecuteAfter = '2',
  // 告警图片
  alarmImage = '3'
}
