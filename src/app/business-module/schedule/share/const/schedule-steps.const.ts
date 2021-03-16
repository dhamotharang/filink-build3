/**
 * 新增人员步骤条数据集合
 */
import {FinalValueEnum} from '../../../../core-module/enum/step-final-value.enum';

export const SetPersonData = [
  {
    number: FinalValueEnum.STEPS_FIRST,
    activeClass: ' active',
    title: '基本信息'
  },
  {
    number: FinalValueEnum.STEPS_SECOND,
    activeClass: '',
    title: '关联用户'
  },
];
