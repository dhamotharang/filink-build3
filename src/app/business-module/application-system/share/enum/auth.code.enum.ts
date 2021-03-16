/**
 * 照明设备列表code码
 */
export enum LightTableEnum {
  /**
   * 设备列表查询权限
   */
  VIEW_EQUIPMENTSList = '09-1-2-1-0',
  /**
   * 开权限
   */
  TURN_ON = '09-1-2-1-1',
  /**
   * 关权限
   */
  TURN_OFF = '09-1-2-1-2',
  /**
   * 上电
   */
  POWER_ON = '09-1-2-1-3',
  /**
   * 下电
   */
  POWER_OFF = '09-1-2-1-4',
  /**
   * 亮度
   */
  DIMMING = '09-1-2-1-5',

  primaryKey = '09-1-2-1',
  primaryOpenKey = '09-1-2-1-1',
  primaryShutKey = '09-1-2-1-2',
  primaryUpKey = '09-1-2-1-3',
  primaryDownKey = '09-1-2-1-4',
  primaryLightKey = '09-1-2-1-5',
  primaryDetailKey = '09-1-2-1-6',
}

/**
 * 照明分组列表code码
 */
export enum LightGroupTableEnum {
  VIEW_GROUPList = '09-1-2-2-0',
  /**
   * 开权限
   */
  TURN_ON = '09-1-2-1-1',
  /**
   * 关权限
   */
  TURN_OFF = '09-1-2-1-2',
  /**
   * 上电
   */
  POWER_ON = '09-1-2-1-3',
  /**
   * 下电
   */
  POWER_OFF = '09-1-2-1-4',
  /**
   * 亮度
   */
  DIMMING = '09-1-2-1-5',
  primaryKey = '09-1-2-2',
  primaryOpenKey = '09-1-2-1-1',
  primaryShutKey = '09-1-2-1-2',
  primaryUpKey = '09-1-2-1-3',
  primaryDownKey = '09-1-2-1-4',
  primaryLightKey = '09-1-2-1-5',
  primaryDetailKey = '09-1-2-2-6',
}

/**
 * 回路列表code码
 */
export enum LightLoopTableEnum {
  /**
   *智慧照明设备列表-回路列表查询权限
   */
  VIEW_LOOPLIST= '09-1-2-3-0',
  primaryKey = '09-1-2-3',
  primaryDetailKey = '09-1-2-3-1',
  primaryPullKey = '09-1-2-3-2',
  primaryGateKey = '09-1-2-3-3',
}

/**
 * 信息屏设备列表code
 */
export enum ReleaseTableEnum {
  /**
   * 设备列表访问查询权限
   */
  VIEW_EQUIPMENTSList = '09-2-2-1-0',
  /**
   * 开权限
   */
  TURN_ON = '09-2-2-1-1',
  /**
   * 关权限
   */
  TURN_OFF = '09-2-2-1-2',
  /**
   * 上电
   */
  POWER_ON = '09-2-2-1-3',
  /**
   * 下电
   */
  POWER_OFF = '09-2-2-1-4',
  /**
   * 亮度
   */
  DIMMING = '09-2-2-1-5',
  /**
   * 音量
   */
  SET_VOLUME = '09-2-2-1-8',

  primaryKey = '09-2-2-1',
  primaryOpenKey = '09-2-2-1-1',
  primaryShutKey = '09-2-2-1-2',
  primaryUpKey = '09-2-2-1-3',
  primaryDownKey = '09-2-2-1-4',
  primaryLightKey = '09-2-2-1-5',
  primaryDetailKey = '09-2-2-1-6',
  primaryPlayKey = '09-2-2-1-7',
  primaryVolume = '09-2-2-1-8',
}

/**
 * 信息屏分组列表code
 */
export enum ReleaseGroupTableEnum {
  VIEW_GROUPList = '09-2-2-2-0',
  /**
   * 开权限
   */
  TURN_ON = '09-2-2-1-1',
  /**
   * 关权限
   */
  TURN_OFF = '09-2-2-1-2',
  /**
   * 上电
   */
  POWER_ON = '09-2-2-1-3',
  /**
   * 下电
   */
  POWER_OFF = '09-2-2-1-4',
  /**
   * 亮度
   */
  DIMMING = '09-2-2-1-5',
  primaryKey = '09-2-2-2',
  primaryOpenKey = '09-2-2-1-1',
  primaryShutKey = '09-2-2-1-2',
  primaryUpKey = '09-2-2-1-3',
  primaryDownKey = '09-2-2-1-4',
  primaryLightKey = '09-2-2-1-5',
  primaryDetailKey = '09-2-2-2-6',
}

/**
 * 安防设备列表code
 */
export enum SecurityEnum {
  /**
   * 开权限
   */
  TURN_ON = '09-3-2-1-1',
  /**
   * 关权限
   */
  TURN_OFF = '09-3-2-1-2',
  /**
   * 上电
   */
  POWER_ON = '09-3-2-1-3',
  /**
   * 下电
   */
  POWER_OFF = '09-3-2-1-4',

  primaryKey = '09-3-2-1',
  primaryOpenKey = '09-3-2-1-1',
  primaryShutKey = '09-3-2-1-2',
  primaryUpKey = '09-3-2-1-3',
  primaryDownKey = '09-3-2-1-4',
  primaryLightKey = '09-3-2-1-5',
  primaryDetailKey = '09-3-2-1-6',
}

/**
 *照明策略列表配置
 */
export enum LightPolicyEnum {
  primaryKey = '09-1-3',
  primaryDetailsKey = '09-1-3-1',
  primaryAddKey = '09-1-3-2',
  primaryEditKey = '09-1-3-3',
  primaryDeleteKey = '09-1-3-4',
  primaryEnableKey = '09-1-3-5',
  primaryDisableKey = '09-1-3-6',
  primaryIssueKey = '09-1-3-7',
}

/**
 * 信息屏策略列表配置
 */
export enum ReleasePolicyEnum {
  primaryKey = '09-2-3',
  primaryDetailsKey = '09-2-3-1',
  primaryAddKey = '09-2-3-2',
  primaryEditKey = '09-2-3-3',
  primaryDeleteKey = '09-2-3-4',
  primaryEnableKey = '09-2-3-5',
  primaryDisableKey = '09-2-3-6',
  primaryIssueKey = '09-2-3-7',
}

/**
 * 联动策略列表配置
 */
export enum LinkagePolicyEnum {
  primaryKey = '09-4',
  primaryDetailsKey = '09-4-1',
  primaryAddKey = '09-4-2',
  primaryEditKey = '09-4-3',
  primaryDeleteKey = '09-4-4',
  primaryEnableKey = '09-4-5',
  primaryDisableKey = '09-4-6',
  primaryIssueKey = '09-4-7',
}

/**
 * 内容工单枚举
 */
export enum ContentWorkWordEnum {
  // 删除
  delete = '09-2-5-1',
  // 取消
  cancel = '09-2-5-3',
  // 转派
  transfer = '09-2-5-4',
  // 退单
  chargeback = '09-2-5-5',
  // 提交
  submit = '09-2-5-6'
}

/**
 * 信息工作台
 */
export enum InformationWorkBenchEnum {
  // 当前告警
  currentAlarm = '02-1',
}




