import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import 'ztree';
import {AreaModel, AreaRecursiveModel, GetAreaModel} from '../../shared/model/area.model';
import {MapService} from '../../../../core-module/api-service/index/map';
import {ResultModel} from '../../../../shared-module/model/result.model';
import {NzI18nService} from 'ng-zorro-antd';
import {MapStoreService} from '../../../../core-module/store/map.store.service';
import {FiLinkModalService} from '../../../../shared-module/service/filink-modal/filink-modal.service';
import {TreeSelectorConfigModel} from '../../../../shared-module/model/tree-selector-config.model';
import {IndexLanguageInterface} from '../../../../../assets/i18n/index/index.language.interface';
import {IndexApiService} from '../../service/index/index-api.service';
import * as lodash from 'lodash';
import {ResultCodeEnum} from '../../../../shared-module/enum/result-code.enum';
import {LanguageEnum} from '../../../../shared-module/enum/language.enum';
import {FilterConditionService} from '../../service/filter-condition.service';
import {indexCoverageType} from '../../../../core-module/const/index/index.const';

declare var $: any;

@Component({
  selector: 'app-planning-tree',
  templateUrl: './planning-tree.component.html',
  styleUrls: ['./planning-tree.component.scss']
})
export class PlanningTreeComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input() treeName: string;
  // tree
  @Input() treeSelectorConfig: TreeSelectorConfigModel = new TreeSelectorConfigModel();
  // 判断怎样渲染
  @Input() isShowNoData = false;
  // 区域选择结果
  @Output() planningDataEvent = new EventEmitter<string[]>();
  // 搜索框组件
  @ViewChild('input') inputElement: ElementRef;
  // 国际化翻译
  public language;
  // 国际化
  public indexLanguage: IndexLanguageInterface;
  // 是否显示区域分组下拉
  public selectType: boolean = false;
  // tree操作对象
  public treeInstance: any;
  // 搜索Key
  public searchKey: string;
  // 搜素信息
  public selectInfo = {
    data: [],
    label: 'label',
    value: 'code'
  };
  // 无数据时显示暂无数据
  public noData: boolean = false;
  // tree配置
  private setting;
  // 区域选择结果
  private areaList;
  // 搜索结果
  private searchResult = [];
  // 递归获取全量区域数据
  private areaRecursiveData: AreaRecursiveModel[] = [];

  constructor(
    private $mapService: MapService,
    private $nzI18n: NzI18nService,
    private $mapStoreService: MapStoreService,
    private $message: FiLinkModalService,
    private $indexApiService: IndexApiService,
    private $filterConditionService: FilterConditionService
  ) {
  }

  /**
   * 防抖
   */
  areaDataShowFacility = lodash.debounce(() => {
    this.planningDataEvent.emit(this.areaList);
    // 只有设施设备列表需要刷新地图
    if (this.treeName === 'zTree') {
      this.$filterConditionService.eventEmit.emit({refresh: true});
    }
  }, 2000, {leading: false, trailing: true});

  public ngOnInit(): void {
    // 国际化配置
    this.language = this.$nzI18n.getLocale();
    this.indexLanguage = this.$nzI18n.getLocaleData(LanguageEnum.index);
    this.initTreeSetting();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.areaList && changes.$mapStoreService.currentValue) {
      this.addTreeData();
    }
  }

  public ngAfterViewInit(): void {
    // 初始化调用接口
    this.getAllAreaList();
  }

  /**
   * 组件销毁
   */
  public ngOnDestroy(): void {
    this.inputElement = null;
  }

  /**
   * 搜索组件选中某一条
   * param event id
   */
  public modelChange(event: string): void {
    const node = this.treeInstance.getNodeByParam('id', event, null);
    this.treeInstance.selectNode(node);
  }

  /**
   * 搜索框input值变化
   * param event
   */
  public inputChange(event: string): void {
    if (event) {
      const node = this.treeInstance.getNodesByParamFuzzy('name',
        event, null);
      this.selectInfo = {
        data: node,
        label: 'name',
        value: 'id'
      };
    } else {
      this.selectInfo = {
        data: [],
        label: 'name',
        value: 'id'
      };
    }

  }

  /**
   * 搜索
   */
  public search(): void {
    const _searchKey = this.searchKey.trim();
    if (this.searchKey) {
      const node = this.treeInstance.getNodesByParamFuzzy('name', _searchKey, null);
      this.searchResult = node;
    }
  }

  /**
   * 选择全部区域
   */
  public clickSelectAll(type?: boolean): void {
    // 获取tree对象
    const treeObj = $.fn.zTree.getZTreeObj(this.treeName);
    if (!treeObj) {
      return;
    }
    // 获取完整树节点
    let checkData;
    checkData = this.$mapStoreService.planningSelectedResults || [];
    const list = treeObj.getNodes();
    // 有缓存，保留操作结果
    if (checkData && typeof (type) !== 'boolean') {
      if (checkData.length === 0) {
        checkData.push(indexCoverageType.noData);
      } else {
        list.forEach(item => {
          checkData.forEach(checkDataItem => {
            if (item.planCode === checkDataItem) {
              treeObj.checkNode(item, true, true, false);
            }
          });
        });
      }
    } else {
      // 根据type类型为全选或去全选
      if (type === true) {
        this.selectNoAreaList(list, treeObj);
        list.forEach(item => {
          treeObj.checkNode(item, type, true, false);
        });
      } else {
        this.selectNoAreaList(list, treeObj);
      }
      // 存入缓存，初始化直接发射事件，跳过防抖
      if (type) {
        this.setAreaSelectedResults(list.map(item => item.planCode));
        this.planningDataEvent.emit(list.map(item => item.planCode));
      } else {
        this.setAreaSelectedResults([indexCoverageType.noData]);
        this.planningDataEvent.emit([indexCoverageType.noData]);
      }
      // 只有设施设备列表需要刷新地图
      this.$filterConditionService.eventEmit.emit({refresh: true});
    }
  }

  /**
   * 去全选递归所有区域
   */
  private selectNoAreaList(list, treeObj): void {
    list.forEach(item => {
      treeObj.checkNode(item, false, true, false);
      if (item.children) {
        this.selectNoAreaList(item.children, treeObj);
      }
    });
  }

  private setAllTreeNodeCheck(list, bool = false) {
    if (!bool) {
      list.forEach(item => {
        item.checked = true;
        if (item.children) {
          item.children = this.setAllTreeNodeCheck(item.children);
        }
      });
      return list;
    } else {
      list.forEach(item => {
        this.$mapStoreService.planningSelectedResults.push(item.planCode);
        if (item.children) {
          this.setAllTreeNodeCheck(item.children, true);
        }
      });
    }
  }

  /**
   * 初始化tree配置
   */
  private initTreeSetting(): void {
    this.setting = {
      check: {
        enable: true,
        chkboxType: {'Y': 'ps', 'N': 'ps'},
        chkStyle: 'checkbox',
        autoCheckTrigger: true
      },
      data: {
        simpleData: {
          enable: true,
          idKey: 'id',
        },
        key: {
          name: 'name',
          children: 'children'
        },
      },
      view: {
        showIcon: false,
        showLine: false
      },
      callback: {
        onCheck: (event, treeId, treeNode) => {
          setTimeout(() => {
            this.getCheckedArea();
          }, 500);
        }
      }
    };
  }

  /**
   * 获取区域列表
   */
  private getAllAreaList(): void {
    // 查询一级区域
    this.$indexApiService.getPlanNames({}).subscribe((result: ResultModel<AreaModel[]>) => {
      if (result.code === ResultCodeEnum.success) {
        console.log(result);
        // 判断有无数据，如果无数据显示暂无数据提示
    // const result = {
    //   'code': '00000',
    //   'msg': '请求成功',
    //   'data': [{
    //     'planId': '3',
    //     'planName': '规划3',
    //     'planCode': '阿萨德dsa',
    //     'level': 1
    //   },
    //     {
    //       'planId': '4',
    //       'planName': '规划4',
    //       'planCode': 'plan04',
    //       'level': 1
    //     }
    //   ]
    // };

    if (result.data.length === 0) {
      this.noData = true;
      return;
    }
    // 默认全部勾选并存入缓存
    this.$mapStoreService.logicPlanningList = this.setAllTreeNodeCheck(result.data);
    if (!this.$mapStoreService.planningSelectedResults.length) {
      this.setAllTreeNodeCheck(result.data, true);
    }
    this.$mapStoreService.chooseAllPlanningID = this.$mapStoreService.logicPlanningList.filter(item => item.hasPermissions)
      .map(item => item.areaId);
    // 加入tree树
    this.addTreeData();
    // 初始化默认区域
    this.clickSelectAll();
    // 设施设备列表初始化
    this.$mapStoreService.isInitLogicPlanningData = true;
    // 获取tree对象
    const treeObj = $.fn.zTree.getZTreeObj(this.treeName);
    // 获取全部节点集合
    const list = treeObj.getNodes();
    // 判断缓存是否为空
    if (this.$mapStoreService.lastPlanningData.length && this.$mapStoreService.lastPlanningData[0] !== 'noData') {
      // 第一个遍历先把所有区域去勾，之后再把缓存中的区域与tree树对比勾选中
      list.forEach(item => {
        treeObj.checkNode(item, false, true, false);
      });
      list.forEach(item => {
        this.$mapStoreService.lastPlanningData.forEach(_item => {
          if (item.planCode === _item) {
            treeObj.checkNode(item, true, true, false);
          }
        });
      });
      // 把数据发射给设施设备类型组件
      this.$mapStoreService.planningSelectedResults = this.$mapStoreService.lastPlanningData;
    } else if (this.$mapStoreService.lastPlanningData[0] === 'noData') {
      // 缓存为空的唯一标识，区域全部去选，把唯一标识发射给设施设备类型组件
      list.forEach(item => {
        treeObj.checkNode(item, false, true, false);
      });
      this.$mapStoreService.planningSelectedResults = ['noData'];
      this.planningDataEvent.emit(['noData']);
    }
    this.getCheckedArea();
    this.getCheckedArea();
    } else {
      this.$message.error(result.msg);
    }
    });
  }

  /**
   * 区域选中结果存入缓存
   * param data
   */
  private setAreaSelectedResults(data: string[]): void {
    this.$mapStoreService.planningSelectedResults = data;
    this.$mapStoreService.lastPlanningData = data;
  }

  /**
   * 区域数据递归
   * param list
   */
  private areaListRecursiveNew(list) {
    const areaList = [];
    list.forEach(item => {
      areaList.push({
        id: item.planId,
        planCode: item.planCode,
        name: item.planName,  // 去掉空格
        isParent: true, // 级别为1时，是父级
        checked: false,
        chkDisabled: false,
        children: []
      });
    });
    return areaList;
  }

  /**
   * 添加数据
   */
  private addTreeData(): void {
    // 把后台返回的数据转化为ztree所需的数据格式
    this.areaRecursiveData = this.areaListRecursiveNew(this.$mapStoreService.logicPlanningList);
    // 创建Areatree树
    $.fn.zTree.init($(`#${this.treeName}`), this.setting, this.areaRecursiveData);
    this.treeInstance = $.fn.zTree.getZTreeObj(this.treeName);
  }

  /**
   * 获取勾选区域
   */
  private getCheckedArea(): void {
    // 获取tree对象
    const treeObj = $.fn.zTree.getZTreeObj(this.treeName);
    const nodes = treeObj.getNodes();
    const list: Array<string> = [];
    treeObj.transformToArray(nodes).forEach(e => {
      const status = e.getCheckStatus();
      if (status.half === false && status.checked) {
        list.push(e.planCode);
      }
    });
    // 当数组长度为0时，添加无数据唯一标识
    if (list.length === 0) {
      list.push(indexCoverageType.noData);
    }
    // 获取最新勾选区域code
    this.areaList = list;
    this.setAreaSelectedResults(list);
    // 选中结果
    this.areaDataShowFacility();
  }
}
