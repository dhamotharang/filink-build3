import {Component, OnInit} from '@angular/core';
import {ProductLanguageInterface} from '../../../../../../assets/i18n/product/product.language.interface';
import {NzI18nService} from 'ng-zorro-antd';
import {CommonLanguageInterface} from '../../../../../../assets/i18n/common/common.language.interface';
import {LanguageEnum} from '../../../../../shared-module/enum/language.enum';

@Component({
  selector: 'app-change-point-model',
  templateUrl: './change-point-model.component.html',
  styleUrls: ['./change-point-model.component.scss']
})
export class ChangePointModelComponent implements OnInit {


  // 产品语言包
  public productLanguage: ProductLanguageInterface;
  // 公共语言包国际化
  public commonLanguage: CommonLanguageInterface;

  public editProductModelVisible;

  constructor(
    private $nzI18n: NzI18nService,
  ) {
  }

  ngOnInit() {
    this.productLanguage = this.$nzI18n.getLocaleData(LanguageEnum.product);
    this.commonLanguage = this.$nzI18n.getLocaleData(LanguageEnum.common);
  }

  public handleOk() {

  }

  public handleCancel() {}
}
