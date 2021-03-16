export class TeamManagementConfig {

  /**
   * 初始化班组管理列表配置项
   * param commonLanguage
   * param scheduleLanguage
   * param teamMemberTpl
   */
  public static initTeamManagementColumnConfig(commonLanguage, scheduleLanguage, teamMemberTpl = null, unitNameSearchTpl = null) {
    return [
      // 选择
      {type: 'select', fixedStyle: {fixedLeft: true, style: {left: '0'}}, width: 60},
      // 序号
      {
        type: 'serial-number', width: 60, title: commonLanguage.serialNumber,
        fixedStyle: {fixedLeft: true, style: {left: '60px'}}
      },
      // 单位
      {
        title: scheduleLanguage.unit, key: 'deptName', width: 150, isShowSort: true,
        searchable: true, configurable: true,
        searchKey: 'deptCodeList',
        searchConfig: {type: unitNameSearchTpl ? 'render' : 'input', renderTemplate: unitNameSearchTpl}
      },
      // 班组名称
      {
        title: scheduleLanguage.teamName, key: 'teamName', width: 150, isShowSort: true,
        searchable: true, configurable: true,
        searchConfig: {type: 'input'}
      },
      // 班组成员
      {
        title: scheduleLanguage.teamMember, key: 'personInformationNames', width: 150, isShowSort: false,
        searchable: true, configurable: true,
        searchKey: 'personIdList',
        searchConfig: {type: teamMemberTpl ? 'render' : 'input', renderTemplate: teamMemberTpl}
      },
      // 备注
      {
        title: scheduleLanguage.remark, key: 'remark', width: 150, isShowSort: true,
        searchable: true, configurable: true,
        searchConfig: {type: 'input'}
      },
      { // 操作列
        title: commonLanguage.operate,
        searchable: true,
        searchConfig: {type: 'operate'},
        key: '', width: 60,
        fixedStyle: {fixedRight: true, style: {right: '0px'}}
      },
    ];
  }
}
