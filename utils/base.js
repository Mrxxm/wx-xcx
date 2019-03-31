
import { Config } from 'config.js';
import { Token } from 'token.js';

class Base{

  constructor(){
    this.baseRequestUrl = Config.restUrl;
  }

  // 当noReFetch为true时，不做未授权重试机制
  request(params, noRefetch){
    var that = this;
    var url = this.baseRequestUrl + params.url;
    if (!params.type) {
      params.type = 'GET';
    }
    
    wx.request({
      url: url,
      data: params.data,
      method: params.type,
      header: {
        'content-type':'application/json',
        'token':wx.getStorageSync('token')
      },
      success:function(res) {

        var code = res.statusCode.toString();
        var startChar = code.charAt(0);

        if (startChar == '2') {
          params.sCallBack && params.sCallBack(res.data);
        } else {

          if (code == '401') {
            // token.getTokenFromServer
            // base.request
            if (!noRefetch) {
              that._refetch(params);
            }
          }
          if (noRefetch) {
            params.eCallBack && params.eCallBack(res.data);
          }
        }

        // if(params.sCallBack){
        //   params.sCallBack(res.data);
        // }
        
      },
      fail:function(err) {

      }
    })
  }

  // 获取元素上绑定的值
  getDataSet(event, key) {
    return event.currentTarget.dataset[key];
  };

  _refetch(param) {
    var token = new Token();
    token.getTokenFromServer((token) => {
      this.request(param, true);
    });
  }

}

export { Base };