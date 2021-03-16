import {PRODUCT_SERVER} from '../api-common.config';

export const ProductRequestUrlConst = {
  // 查询产品列表
  queryProductList: `${PRODUCT_SERVER}/productInfo/queryProductList`,
  // 模版下载
  downloadTemplate: `${PRODUCT_SERVER}/productImage/downloadTemplate`,
  // 根据产品查询产品信息
  getProductInfoById: `${PRODUCT_SERVER}/productInfo/getProductInfoById`,
};
