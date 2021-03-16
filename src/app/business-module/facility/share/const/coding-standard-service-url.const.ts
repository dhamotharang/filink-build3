import {DEVICE_SERVER} from '../../../../core-module/api-service/api-common.config';

export const CodingStandardServiceUrlConst = {
  // 查询编码标准列表
  codingRuleListByPage: `${DEVICE_SERVER}/codingRule/codingRuleListByPage`,
  // 查询可选字段
  queryCodingRuleField: `${DEVICE_SERVER}/codingRule/queryCodingRuleField`,
  // 启用编码标准
  enableCodingRule: `${DEVICE_SERVER}/codingRule/enableCodingRule`,
  // 禁用编码标准
  disableCodingRule: `${DEVICE_SERVER}/codingRule/disableCodingRule`,
  // 删除编码标准
  deleteCodingRule: `${DEVICE_SERVER}/codingRule/disableCodingRule`
};
