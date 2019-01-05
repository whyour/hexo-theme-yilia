var backTop = function (domE, ctn, distance) {
  if (!domE) return;
  var timer = null;
  var _onscroll = window.onscroll,
    _onclick = domE.onclick;
  (ctn || window).onscroll = throttle(function () {
    typeof _onscroll === 'function' && _onscroll.apply(this, arguments);
    var currentTop = ctn.scrollTop || document.documentElement.scrollTop || document.body.scrollTop
    toggleDomE(currentTop);
    findHeadPosition(currentTop)
  }, 50, 100);
  domE.onclick = function () {
    typeof _onclick === 'function' && _onclick.apply(this, arguments);
    // var baseCt = ctn.scrollTop || document.documentElement.scrollTop || document.body.scrollTop;
    timer = setInterval(function () { //设置一个计时器
      var ct = ctn.scrollTop || document.documentElement.scrollTop || document.body.scrollTop; //获取距离顶部的距离
      var diff = Math.max(10, ct / 6);
      ct -= diff;
      if (ct > 0) {//如果与顶部的距离大于零
        ctn.scrollTop = ctn.scrollTop - diff;
        window.scrollTo(0, ct);//向上移动10px
      } else {//如果距离小于等于零
        ctn.scrollTop = 0;
        window.scrollTo(0, 0);//移动到顶部
        clearInterval(timer);//清除计时器
      }
    }, 10);//隔10ms执行一次前面的function，展现一种平滑滑动效果
  };

  function toggleDomE(currentTop) {
    domE.style.display = currentTop > (distance || 500) ? 'block' : 'none';
  }
  function throttle(func, wait, mustRun) {
    var timer = null;
    var startTime = new Date()
    return function () {
      var self = this, args = arguments, curTime = new Date();
      if (timer) clearTimeout(timer);
      if (curTime - startTime >= mustRun) {
        func.apply(self, args)
        startTime = curTime
      } else {
        timer = setTimeout(function () {
          return typeof func === 'function' && func.apply(self, args);
        }, wait);
      }
    }
  }

  function findHeadPosition(top) {
    // assume that we are not in the post page if no TOC link be found,
    // thus no need to update the status
    if ($('.toc-link').length === 0) {
      return false
    }

    if (top < 200) {
      $('.toc-link').removeClass('active')
      // $('.toc-child').hide()
    }
    var list = $('.article-content').find('h1,h2,h3,h4,h5,h6')
    var currentId = ''
    list.each(function () {
      var head = $(this);
      var _top = head.offset().top;
      if (0 > _top - 35) {
        currentId = '#' + $(this).attr('id')
      }
    })
    if (currentId === '') {
      currentId = "#title";
    }
    var currentActive = $('.toc-link.active')
    if (currentId && currentActive.attr('href') !== currentId) {

      $('.toc-link').removeClass('active')
      var _this = $('.toc-link[href="' + currentId + '"]')
      _this.addClass('active')
      // var parents = _this.parents('.toc-child')
      // if (parents.length > 0) {
      //   var child;
      //   parents.length > 1 ? child = parents.eq(parents.length - 1).find('.toc-child') : child = parents
      //   if (child.length > 0 && child.is(':hidden')) {
      //     expandToc(child)
      //   }
      //   parents.eq(parents.length - 1).closest('.toc-item').siblings('.toc-item').find('.toc-child').hide()
      // } else {
      //   if (_this.closest('.toc-item').find('.toc-child').is(':hidden')) {
      //     expandToc(_this.closest('.toc-item').find('.toc-child'))
      //   }
      //   _this.closest('.toc-item').siblings('.toc-item').find('.toc-child').hide()
      // }
    }
  }

};

function init() {
  backTop(document.getElementById('js-jump-container'), document.getElementById('container'));
}

module.exports = {
  init: init
}
