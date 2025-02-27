angular.module("BlocksApp").controller("TokenListController", function ($stateParams, $rootScope, $scope, $http) {
  $scope.$on("$viewContentLoaded", function () {
    // initialize core components
    App.initAjax();
  });
  $scope.settings = $rootScope.setup;
  // $scope.searchTokenInput = $stateParams.token
  //   ? $stateParams.token
  //   : undefined;

  var tokenList = "/" + ($scope.settings.tokenList || "tokens.json");

  $http.get(tokenList).then(function (res) {
    var contentType = res.headers("Content-Type");
    if (contentType.indexOf("/json") > 0) {
      $scope.contracts = res.data;
    } else {
      $scope.contracts = [];
    }
  });

  const getTokens = function() {
    $('#tokens-address').DataTable({
      processing: true,
      serverSide: true,
      paging: true,
      ajax: function(data, callback, settings) {
        data.ERC = 0;
        data.page = Math.ceil(data.start / data.length);
        data.pageSize = data.length;
        data.searchStr = data.search.value;
        $http.post('/tokenListData', data).then(function(resp) {
          const data = resp.data.list.map(function(token) {
            return [token.tokenName, token.address, !!token.sourceCode ? 'Verified' : 'Unverified'];
          });
          delete resp.data['list'];
          resp.data.data = data;
          callback(resp.data);
        });
      },
      lengthMenu: [
        [10, 20, 50, 100, -1],
        [10, 20, 50, 100, "All"] // change per page values here
      ],
      pageLength: 10,
      language: {
        lengthMenu: "_MENU_ Tokens",
        zeroRecords: "No tokens found",
        infoEmpty: "",
        infoFiltered: "(filtered from _MAX_ total tokens)"
      },
      columnDefs: [
        { orderable: false, "targets": [0,1,2] },
        {
          render:
            function(data, type, row) {
              return '<a href="/token/' + data +'">' + data + '</a>'
            },
          targets: [1]
        },
      ],
    });
  }

  getTokens();

  // $scope.page = 0;
  // var totalPage = 0;
  // $scope.getInfoList = function (page) {
  //   $http({
  //     method: "POST",
  //     url: "/tokenListData",
  //     data: {
  //       ERC: 0,
  //       page: page,
  //       totalPage: totalPage,
  //       searchStr: $scope.searchTokenInput,
  //     },
  //   }).then(function (resp) {
  //     $scope.page = resp.data.page;
  //     var pages = [];
  //     for (i = 0; i < resp.data.totalPage; i++) {
  //       pages.push(i + 1);
  //     }
  //     $scope.pages = pages;
  //     totalPage = resp.data.totalPage;
  //     $scope.totalPage = resp.data.totalPage;
  //     $scope.contracts = resp.data.list;
  //   });
  // };
  // $scope.getInfoList();
});
