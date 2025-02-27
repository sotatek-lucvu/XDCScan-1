angular
  .module("BlocksApp")
  .controller(
    "TokenController",
    function ($stateParams, $rootScope, $scope, $http, $location) {
      $scope.$on("$viewContentLoaded", function () {
        // initialize core components
        App.initAjax();
      });
      var activeTab = $location.url().split("#");
      if (activeTab.length > 1) {
        $scope.activeTab = activeTab[1];
      } else {
        $scope.activeTab = "tokenTransfers";
      }
      console.log("activeTab", $scope.activeTab);

      $rootScope.$state.current.data["pageSubTitle"] = $stateParams.hash; //replace with token name
      // $scope.addrHash = isAddress($stateParams.hash) ? $stateParams.hash : undefined;
      $scope.addrHash = $stateParams.hash ? $stateParams.hash : undefined;

      var address = $scope.addrHash;
      $scope.token = { balance: 0 };
      $scope.settings = $rootScope.setup;

      //fetch dao stuff
      $http({
        method: "POST",
        url: "/tokenrelay",
        data: { action: "info", address: address },
      }).then(function (resp) {
        console.log(resp.data);
        $scope.token = resp.data;
        $scope.token.address = address;
        $scope.addr = { bytecode: resp.data.bytecode };
        if (resp.data.name)
          $rootScope.$state.current.data["pageTitle"] = resp.data.name;

        if ($scope.activeTab === "tokenTransfers") {
          $scope.transferTokens(0);
        } else if ($scope.activeTab === "tokenHolders") {
          $scope.tokenHolders(0);
        }
      });

      // fetch transactions
      // var fetchTxs = function (after) {
      //   var data = { action: "transaction", address: $scope.addrHash };
      //   if (after && after > 0) {
      //     data.after = after;
      //   }
      //   $http({
      //     method: "POST",
      //     url: "/tokenrelay",
      //     data,
      //   }).then(function (resp) {
      //     $scope.contract_transactions = resp.data.transaction;
      //     console.log('$scope.contract_transactions', $scope.contract_transactions);
      //     $scope.page = {
      //       count: resp.data.count,
      //       after: resp.data.after,
      //       next: resp.data.after + resp.data.count,
      //     };
      //     if (resp.data.after > 0) {
      //       $scope.page.prev = resp.data.after - resp.data.count;
      //     } else {
      //       $scope.page.prev = 0;
      //     }
      //   });
      // };

      // fetchTxs();
      // $scope.fetchTxs = fetchTxs;

      $scope.form = {};
      $scope.errors = {};
      $scope.showTokens = false;
      $scope.getBalance = function (a) {
        var addr = a.toLowerCase();

        $scope.form.addrInput = "";
        $scope.errors = {};

        $scope.form.tokens.$setPristine();
        $scope.form.tokens.$setUntouched();
        if (isAddress(addr)) {
          $http({
            method: "POST",
            url: "/tokenrelay",
            data: { action: "balanceOf", user: addr, address: address },
          }).then(function (resp) {
            console.log(resp, "resp");
            console.log(resp.data);
            $scope.showTokens = true;
            $scope.userTokens = resp.data.tokens;
          });
        } else $scope.errors.address = "Invalid Address";
      };
      $scope.transferPage = 0;
      $scope.transferTokens = function (transferPage) {
        console.log("【request】 tokenTransfer");

        $http({
          method: "POST",
          url: "/tokenrelay",
          data: {
            action: "tokenTransfer",
            address: address,
            transferPage: transferPage,
            fromAccount: $scope.acc,
          },
        }).then(function (resp) {
          resp.data.forEach(function (record) {
            /***
             * Author: Luke.Nguyen
             * Company: sotatek
             * Country: Vietnam
             * PhoneNumber: +84 386743836
             *
             * Patch date: 18/05/2021
             *
             * Newly updated for transfer_tokens pages
             *
             *
             *
             *
             * **/

            record.value =
              record.value / parseFloat(10 ** parseInt($scope.token.decimals));

            record.amount = record.value;

            record.methodName = record.method;
            record.transactionHash = record.hash;

            /**
             * end update
             *
             * **/
          });
          $scope.transferPage = transferPage;
          $scope.transfer_tokens = resp.data;
          console.log("$scope.transfer_tokens", $scope.transfer_tokens);
        });
      };

      /***
       * Author: Luke.Nguyen
       * Company: sotatek
       * Country: Vietnam
       * PhoneNumber: +84 386743836
       *
       * Patch date: 18/05/2021
       *
       * Newly updated for token_holders pages
       *
       *
       *
       *
       * **/
      $scope.holderPage = 0;
      $scope.tokenHolders = function (holderPage) {
        console.log("【request】 tokenHolder");

        $http({
          method: "POST",
          url: "/tokenrelay",
          data: { action: "tokenHolder", address: address },
        }).then(function (resp) {
          console.log("【request】 tokenHolder " + address);
          var rank = 1;
          var total = 0;

          resp.data.forEach(function (record) {
            /**
             * newly implemented logic here
             *
             */

            record.quantity =
              Number(record.balance) /
              parseFloat(10 ** parseInt($scope.token.decimals));
            record.value =
              record.quantity * parseFloat($scope.token.tokenPrice);
            total += record.quantity;
          });

          resp.data.sort(function (a, b) {
            return b.quantity - a.quantity;
          });

          resp.data.forEach(function (record) {
            record.rank = rank;
            record.percentage = record.quantity / total;
            rank += 1;
          });

          console.log(resp);
          $scope.holderPage = holderPage;
          $scope.token_holders = resp.data;
        });
      };

      /**
       * end update token_holders
       *
       * **/

      // $scope.internalPage = 0;
      // $scope.internalTransaction = function (internalPage) {
      //   $http({
      //     method: "POST",
      //     url: "/transactionRelay",
      //     data: {
      //       action: "internalTX",
      //       address: address,
      //       internalPage: internalPage,
      //       fromAccount: $scope.acc,
      //     },
      //   }).then(function (resp) {
      //     resp.data.forEach(function (record) {
      //       record.amount =
      //         record.amount / 10 ** parseInt($scope.token.decimals);
      //     });
      //     $scope.internalPage = internalPage;
      //     $scope.internalDatas = resp.data;
      //   });
      // };
      // if ($scope.activeTab === "internalTransactions") {
      //   $scope.internalTransaction(0);
      // }
      $scope.tokenTransfrs = { transfervalue: 0 };
      $http({
        method: "POST",
        url: "/transactionRelay",
        data: { action: "countTX", address: address, fromAccount: $scope.acc },
      }).then(function (resp) {
        $scope.tokenTransfrs = resp.data;
      });

      // $scope.transactionPage = 0;
      // $scope.contractTransaction=function(transactionPage) {
      //   $http({
      //     method: 'POST',
      //     url: '/transactionRelay',
      //     data: {"action": "allTX", "address": address, 'fromAccount':$scope.acc, "transactionPage":transactionPage}
      //   }).success(function(repData) {
      //     $scope.contractTxList = repData;
      //   });
      // }
      //fetch all transactions
    }
  )
  .directive("contractSource", function ($http) {
    return {
      restrict: "E",
      templateUrl: "/views/contract-source.html",
      scope: false,
      link: function (scope, elem, attrs) {
        //fetch contract stuff
        $http({
          method: "POST",
          url: "/compile",
          data: { addr: scope.addrHash, action: "find" },
        }).then(function (resp) {
          scope.contract = resp.data;
        });
      },
    };
  })
  .directive("transferTokens", function ($http) {
    return {
      restrict: "E",
      templateUrl: "/views/transfer-tokens.html",
      scope: false,
      link: function (scope, elem, attrs) {
        //fetch transfer
        var getTransferTokens = function (after) {
          var data = { action: "tokenTransfer", address: scope.addrHash };
          if (after && after > 0) {
            data.after = after;
          }
          $http({
            method: "POST",
            url: "/tokenrelay",
            data,
          }).then(function (resp) {
            scope.transfer_tokens = resp.data.transfer;
            scope.page = { after: resp.data.after, count: resp.data.count };
            scope.page.next = resp.data.after + resp.data.count;
            if (resp.data.after > 0) {
              scope.page.prev = resp.data.after - resp.data.count;
            } else {
              scope.page.prev = 0;
            }
          });
        };
        scope.getTransferTokens = getTransferTokens;
        getTransferTokens();
      },
    };
  })

  /***
   * Author: Luke.Nguyen
   * Company: sotatek
   * Country: Vietnam
   * PhoneNumber: +84 386743836
   *
   * Patch date: 18/05/2021
   *
   * Newly updated for token_holders pages
   *
   *
   *
   *
   * **/
  .directive("tokenHolders", function ($http) {
    return {
      restrict: "E",
      templateUrl: "/views/token-holders.html",
      scope: false,
      link: function (scope, elem, attrs) {
        //fetch contract stuff
        $http({
          method: "POST",
          url: "/compile",
          data: { addr: scope.addrHash, action: "find" },
        }).then(function (resp) {
          scope.contract = resp.data;
        });
      },
    };
  });
