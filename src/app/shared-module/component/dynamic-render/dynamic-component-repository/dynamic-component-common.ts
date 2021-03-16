import {ExecuteInstructionsModel} from '../../../../business-module/index/shared/model/execute-instructions.model';
import {ResultModel} from '../../../../shared-module/model/result.model';
import {ResultCodeEnum} from '../../../../shared-module/enum/result-code.enum';
import {SessionUtil} from '../../../util/session-util';
import {MapService} from '../../../../core-module/api-service/index/map';
import {FiLinkModalService} from '../../../service/filink-modal/filink-modal.service';
import {IndexLanguageInterface} from '../../../../../assets/i18n/index/index.language.interface';
import {FacilityForCommonService} from '../../../../core-module/api-service/facility';

export class DynamicComponentCommon {

  public indexLanguage: IndexLanguageInterface;

  constructor(public $mapService: MapService,
              public $message: FiLinkModalService,
              public $facilityCommonService: FacilityForCommonService) {

  }

  /**
   * 执行指令下发
   */
  public executeInstructions(body: ExecuteInstructionsModel<{}>, isNeedCheckMode = false) {
    this.$mapService.instructDistribute(body).subscribe((result: ResultModel<string>) => {
      if (isNeedCheckMode) {
        // 需查询指令下发模式
        this.checkEquipmentMode(body.equipmentIds).then(resolve => {
          if (result.code === ResultCodeEnum.success) {
            if (resolve.code === ResultCodeEnum.success) {
              // 弹出指令下发成功提示
              this.$message.success(this.indexLanguage.theInstructionIsIssuedSuccessfully);
            } else {
              // 指令异常弹出指令模式提示，不影响指令下发结果
              this.$message.error(resolve.msg);
            }
          } else {
            this.$message.warning(result.msg);
          }
        });
      } else {
        if (result.code === ResultCodeEnum.success) {
          this.$message.success(this.indexLanguage.theInstructionIsIssuedSuccessfully);
        } else {
          this.$message.warning(result.msg);
        }
      }
    });
  }

  /**
   * 判断是否有操作权限
   */
   checkHasRole(code: string): boolean {
    return !SessionUtil.checkHasRole(code);
  }
  /**
   * 查询是手动控制还是自动
   */
  private checkEquipmentMode(data): Promise<ResultModel<any>> {
    return new Promise((resolve, reject) => {
      this.$facilityCommonService.checkEquipmentMode({equipmentIdList: data}).subscribe((res: ResultModel<any>) => {
        resolve(res);
      });
    });
  }
}
