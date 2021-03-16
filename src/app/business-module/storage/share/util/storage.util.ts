import {CommonUtil} from '../../../../shared-module/util/common-util';
import {DeliveryStatusEnum, DeliveryStatusIconEnum, WarehousingStatusEnum, WarehousingStatusIconEnum} from '../enum/material-status.enum';
import {UserRoleModel} from '../../../../core-module/model/user/user-role.model';
import {ProductInfoModel} from '../../../../core-module/model/product/product-info.model';
import {SupplierDataModel} from '../../../../core-module/model/supplier/supplier-data.model';

export class StorageUtil {
  /**
   * 获取入库状态图标
   */
  public static getWarehousingStatusIconClass(type): string {
    const classStr = CommonUtil.enumMappingTransform(type, WarehousingStatusEnum, WarehousingStatusIconEnum);
    return `iconfont fiLink-warehousing-${classStr} ${classStr}-icon`;
  }

  /**
   * 获取出库状态图标
   */
  public static getDeliveryStatusIconClass(type): string {
    const classStr = CommonUtil.enumMappingTransform(type, DeliveryStatusEnum, DeliveryStatusIconEnum);
    return `iconfont fiLink-delivery-${classStr} ${classStr}-icon`;
  }

  /**
   * 用户选择
   */
  public static selectUser(list: UserRoleModel[], that): void {
    that.checkUserObject = {
      userIds: list.map(v => v.id) || [],
      userName: list.map(v => v.userName).join(',') || '',
    };
    that.userFilterValue.filterValue = that.checkUserObject.userIds.length > 0 ? that.checkUserObject.userIds : null;
    that.userFilterValue.filterName = that.checkUserObject.userName;
  }

  /**
   * 规格型号选择
   */
  public static selectModel(list: ProductInfoModel[], that): void {
    that.selectModelObject = {
      ids: list.map(v => v.productId) || [],
      name: list.map(v => v.productModel).join(',') || '',
    };
    that.modelFilterValue.filterValue = that.selectModelObject.ids.length > 0 ? that.selectModelObject.ids : null;
    that.modelFilterValue.filterName = that.selectModelObject.name;
  }

  /**
   * 供应商选择
   */
  public static selectSupplier(list: SupplierDataModel[], that): void {
    that.selectSupplierObject = {
      ids: list.map(v => v.supplierId) || [],
      name: list.map(v => v.supplierName).join(',') || '',
    };
    that.supplierFilterValue.filterValue = that.selectSupplierObject.ids.length > 0 ? that.selectSupplierObject.ids : null;
    that.supplierFilterValue.filterName = that.selectSupplierObject.name;
  }
}
