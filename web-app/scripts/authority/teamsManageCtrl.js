(function () {
    var app = angular.module('app');

    app.controller('teamsManageCtrl', ['$scope', 'netManager', 'DTOptionsBuilder', 'SweetAlert',
        function ($scope, netManager, DTOptionsBuilder, SweetAlert, $q) {
            $scope.dtOptions = DTOptionsBuilder.newOptions()
                .withDOM('<"html5buttons"B>lTfgitp')
                .withButtons([
                    {
                        text: '添加小组',
                        action: function (e, dt, node, config) {
                            $scope.addTeams = {};
                            $scope.addTeams.submitted = false;
                            $('#addTeamsModule').modal('show');
                        }
                    }
                ]);

            init();

            //编辑
            var editData = {};
            $scope.edit = function (editItem) {
                console.log('editItem', editItem);
                $scope.editData = {
                    name : editItem.name,
                    leader : editItem.leader.name,
                    selMember : editItem.members
                };
            };
            $scope.saveEdit = function () {
                var editData = {
                    leader: $scope.editData.account,
                    name: $scope.editData.name,
                    selMember: $scope.editData.selMember
                };
                console.log('eidtData', editData);
                /*todo:*/
                netManager.put('/users/' + $scope.editData['_id'], editData).then(function (res) {
                    SweetAlert.swal("编辑成功!", "success");
                    init();
                }, function (err) {
                    SweetAlert.swal("编辑失败!", "error")
                    console.error(err);
                });
            };
            $scope.editData = editData;

            //添加
            var addTeams = {};
            $scope.saveTeams = function () {
                $scope.addTeams.submitted = true;
                if ($scope.formAdd.$valid && $scope.addTeams.selMember.length) {
                        var saveUserData = {
                            name: $scope.addTeams.name,
                            leader: $scope.addTeams.name,
                            memebers: $scope.addTeams.selMember
                        };
                    console.log('saveUserData',saveUserData);
                    netManager.post('/users', saveUserData).then(function (res) {
                        $('#addTeamsModule').modal('hide');
                        SweetAlert.swal("保存成功!", "success");
                        init();
                    }, function (err) {
                        console.error(err);
                        SweetAlert.swal("保存失败!", 'error');
                    });
                }
            };
            $scope.addTeams = addTeams;

            //初始化页面
            function init() {
                $scope.tableData = [
                    {
                        _id: "小组id",
                        name: "小组名",
                        leader: {
                            _id: "组长的用户id",
                            account: "组长的用户名",
                            name: "组长的姓名"
                        },
                        members: [
                            {_id: "组员的用户id", account: "组员的用户名", name: "组员的姓名"},
                            {_id: "组员的用户id", account: "组员的用户名", name: "组员的姓名"}
                        ],
                        createdAt: "创建时间",
                        updatedAt: "更新时间"
                    },
                    {
                        _id: "小组id",
                        name: "小组名",
                        leader: {
                            _id: "组长的用户id",
                            account: "组长的用户名",
                            name: "组长的姓名"
                        },
                        members: [
                            {_id: "组员的用户id", account: "组员的用户名", name: "组员的姓名"},
                            {_id: "组员的用户id", account: "组员的用户名", name: "组员的姓名"}
                        ],
                        createdAt: "创建时间",
                        updatedAt: "更新时间"
                    }
                ];
                $scope.state = 'Alabama';
                var members = [
                    'Alaska',
                    'Arizona',
                    'Arkansas',
                    'California'
                ];
                $scope.members = members;

                /*netManager.get('/teams').then(function (res) {
                 $scope.tableData = [
                 {
                 _id: "小组id",
                 name: "小组名",
                 leader: {
                 _id: "组长的用户id",
                 account: "组长的用户名",
                 name: "组长的姓名"
                 },
                 members: [
                 {_id: "组员的用户id", account: "组员的用户名", name: "组员的姓名"},
                 {_id: "组员的用户id", account: "组员的用户名", name: "组员的姓名"}
                 ],
                 createdAt: "创建时间",
                 updatedAt: "更新时间"
                 },
                 {
                 _id: "小组id",
                 name: "小组名",
                 leader: {
                 _id: "组长的用户id",
                 account: "组长的用户名",
                 name: "组长的姓名"
                 },
                 members: [
                 {_id: "组员的用户id", account: "组员的用户名", name: "组员的姓名"},
                 {_id: "组员的用户id", account: "组员的用户名", name: "组员的姓名"}
                 ],
                 createdAt: "创建时间",
                 updatedAt: "更新时间"
                 }
                 ];
                 console.log($scope.tableData);
                 $scope.isLoad = false;
                 }, function (err) {
                 console.error(err);
                 });*/
            }

        }
    ]);

}());