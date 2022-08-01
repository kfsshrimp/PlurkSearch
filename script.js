(()=>{
    var Ex = {
        id:"PlurkSearch",
        config:{
            sort:{
                "posted":"日期",
                "favorite_count":"喜歡數",
                "replurkers_count":"轉噗數",
                "response_count":"回噗數"
            },
            porn:{
                "all":"全部",
                "true":"成人",
                "false":"非成人"
            },
            loop_sec:2000,
            loop_safe:100,
            page_per_count:20,
            max:100,
            XMLmax:100 * 100,
            msg:{
                search_end:(end,start,length,last)=>{
                    return `${end}~${start}期間搜尋完成,共${length}噗<BR>(今日查詢餘額：${last})`
                },
                day_limit:(nick_name)=>{
                    return `帳號【${nick_name}】今日已達查詢上限,請明日再使查詢`
                },
                Progress:(number,day)=>{
                    return `搜尋中：${number}%(${day})`;
                },
                nick_name_err:`帳號輸入有誤`,
                xml:`系統今日已達查詢上限,請明日再查詢`,
                time_range_err:`開始時間不可大於結果時間`,
                time_range_err2:`搜尋範圍不可大於31天`
            }
        },
        flag:{
            page:1,
            local:{},
            session:{}
        },
        temp:{
            Plurk:(data)=>{

                var div = document.createElement("div");

                div.innerHTML = `
                <div class="PlurkDiv">
                    <div>
                        ${data.content}
                        <hr>

                        <div>
                        【${data.no}】${Ex.func.PlurkDate(data.posted)} / 喜歡：<span class="fav">${data.favorite_count}</span> / 轉噗：<span class="rep">${data.replurkers_count}</span> / 回噗：<span class="rep">${data.response_count}</span> / <a href="https://www.plurk.com/p/${parseInt(data.plurk_id).toString(36)}" target="_blank">PLURK</a> / <a data-event="ClickEvent" data-plurk_id=${data.plurk_id} data-mode="TextPrint" id="TextPrint_${data.plurk_id}">複製</a>

                        </div>

                    </div>
                </div>`;

                return div;
            }
        },
        func:{
            Block:(sec)=>{

                var div = document.createElement("div");
                document.body.prepend(div);

                div.innerHTML = 
                `<div style="
                position: absolute;
                height: 100px;
                width: 100px;
                top: calc(50% - 100px);
                left: calc(50% - 100px);
                border-radius: 50%;
                border-top: 5px solid #aaa;"></div>`;

                div.style = `
                    overflow:hidden;
                    width: 100%;
                    height: 100%;
                    z-index: 99;
                    background: #000;
                    position: absolute;
                    opacity:1;
                    transition-duration: ${sec}s;
                    cursor: wait;
                `;

                var r = 0;
                var _t = setInterval(()=>{
                    r++;
                    div.querySelector("div").style.transform = `rotate(${r}deg)`;
                    
                },1);
                
                setTimeout(()=>{
                    div.style.opacity = 0;
                    
                    setTimeout(()=>{ div.remove();clearInterval(_t); },sec * 1000);

                },sec * 1000);
                

            },
            PageControl:()=>{

                var total = Ex.PlurkApi.search_plurks.length;

                document.querySelectorAll(`#PageBar [data-mode="PageChange"]`).forEach(o=>{
                    o.setAttribute("disabled","");
                });

                if( (Ex.flag.page*1+1)<=Math.ceil(total/Ex.config.page_per_count) )
                {
                    document.querySelector(`#PageBar [data-path="next"]`).removeAttribute("disabled");
                }

                if( (Ex.flag.page-1)*Ex.config.page_per_count>0)
                {
                    document.querySelector(`#PageBar [data-path="prev"]`).removeAttribute("disabled");
                }

                if(Ex.PlurkApi.plurks.length<=Ex.config.page_per_count)
                {
                    document.querySelectorAll(`#PageBar [data-mode="PageChange"]`).forEach(o=>{
                        o.setAttribute("disabled","");
                    });
                }

            },
            PlurkList:(plurks)=>{

                document.querySelector("#PlurkList").innerHTML = ``;
                
                var start = ``,end = ``,p_start = ``,p_end = ``,
                ymd = document.querySelectorAll(`select[data-mode="ymdchange"]`),
                sort = document.querySelector(`select[data-mode="sort"]`),
                porn = document.querySelector(`select[data-mode="porn"]`);


                p_start = `${ymd[3].value}/${ymd[4].value}/${ymd[5].value}`;
                p_end = `${ymd[0].value}/${ymd[1].value}/${ymd[2].value}`;

                start = new Date(p_start);
                end = new Date(p_end);

                start = new Date( start.setDate( start.getDate()+1 ) )

                var search_plurks = [];

                
                
                for(var i in plurks)
                {
                    let data = plurks[i];

                    
                    if( 
                        new Date(data.posted).toISOString() >= end.toISOString() && 
                        new Date(data.posted).toISOString() <= start.toISOString() && 
                        /*
                        (
                            new Date(data.posted).getFullYear()<=parseInt(ymd[3].value) && 
                            new Date(data.posted).getFullYear().toString()>=parseInt(ymd[0].value)
                        )
                        &&
                        (
                            (new Date(data.posted).getMonth()+1)<=parseInt(ymd[4].value) && 
                            (new Date(data.posted).getMonth()+1)>=parseInt(ymd[1].value)
                        )
                        &&
                        (
                            new Date(data.posted).getDate()<=parseInt(ymd[5].value) && 
                            new Date(data.posted).getDate()>=parseInt(ymd[2].value)
                        )
                        */
                        (
                            porn.value===data.porn.toString() || 
                            porn.value==="all"
                        )
                    )
                    {
                        search_plurks.push(data);
                    }
                }


                console.log(search_plurks);

                /*
                if(sort.value==="favorite_count")
                    search_plurks.sort( (a,b)=>{return (b.favorite_count!==a.favorite_count)?b.favorite_count - a.favorite_count:b.replurkers_count - a.replurkers_count});
                else if(sort.value==="replurkers_count")
                    search_plurks.sort( (a,b)=>{return (b.replurkers_count!==a.replurkers_count)?b.replurkers_count - a.replurkers_count:b.favorite_count - a.favorite_count});
                */


                search_plurks.sort( (a,b)=>{return b[sort.value] - a[sort.value]});




                Ex.PlurkApi.search_plurks = search_plurks;

                for(var i in search_plurks)
                {
                    let data = search_plurks[i];

                    data.no = i*1+1;


                    if( (Ex.flag.page-1)*Ex.config.page_per_count>=data.no || Ex.flag.page*Ex.config.page_per_count<data.no ) continue;

                    document.querySelector("#PlurkList").appendChild(

                        Ex.temp.Plurk(data)

                    );
                }
                

                document.querySelector("#Progress").innerHTML = Ex.config.msg.search_end(p_end,p_start,search_plurks.length,Ex.config.max-Ex.flag.NickNameCount);


                Ex.func.PageControl();

                Ex.func.ClickEvent();


            },
            SelectYMD:(y,m,d)=>{

                var y_select = ``,m_select = ``,d_select = ``;

                for(var i=new Date().getFullYear()-10;i<=new Date().getFullYear();i++)
                    y_select += `<option ${(i===new Date().getFullYear())?"selected":""}>${i}</option>`;

                for(var i=1;i<=12;i++)
                    m_select += `<option ${(i===(parseInt(m)||new Date().getMonth()+1))?"selected":""}>${i.toString().padStart(2,'0')}</option>`;


                for(var i=1;i<=new Date( y||new Date().getFullYear() , m||(new Date().getMonth()+1) ,0).getDate();i++)
                    d_select += `<option ${(i===(parseInt(d)||new Date().getDate()))?"selected":""}>${i.toString().padStart(2,'0')}</option>`;

                
                return {y:y_select,m:m_select,d:d_select}
            },
            SelectHtml:(obj,val)=>{
                var html = ``;
                for(var v in obj)
                    html += `<option value="${v}" ${(v===val)?"selected":""}>${obj[v]}</option>`

                return html;
            },
            ChangeEvent:(e)=>{

                if(e===undefined)
                {
                    document.querySelectorAll(`[data-event="ChangeEvent"]`).forEach(o=>{

                        Ex.flag.ChangeEventRegister = Ex.flag.ChangeEventRegister||[];

                        if(Ex.flag.ChangeEventRegister.indexOf(o.id)===-1)
                        {
                            //console.log('register ChangeEvent')
                            Ex.flag.ChangeEventRegister.push(o.id);
                            o.addEventListener("change",Ex.func.ChangeEvent);
                        }
                    });


                    return;
                }

                switch (e.target.dataset.mode){

                    case "ymdchange":
                        var ymd = document.querySelectorAll(`[data-mode="ymdchange"][data-group="${e.target.dataset.group}"]`);


                        ymd[2].innerHTML = Ex.func.SelectYMD( ymd[0].value,ymd[1].value,1 ).d;
                    break;

                    case "sort":

                        Ex.func.PlurkList(Ex.PlurkApi.plurks);

                    break;

                    case "porn":

                        Ex.func.PlurkList(Ex.PlurkApi.plurks);

                    break;

                }

            },
            ClickEvent:(e)=>{

                if(e===undefined)
                {
                    document.querySelectorAll(`[data-event="ClickEvent"]`).forEach(o=>{

                        Ex.flag.ClickEventRegister = Ex.flag.ClickEventRegister||[];

                        if(Ex.flag.ClickEventRegister.indexOf(o.id)===-1)
                        {
                            //console.log('register ClickEvent')
                            Ex.flag.ClickEventRegister.push(o.id);
                            o.addEventListener("click",Ex.func.ClickEvent);
                        }
                    });


                    return;
                }

                switch (e.target.dataset.mode){


                    case "Search":
                        
                        document.querySelector(`[data-mode="Search"]`).setAttribute("disabled","");

                        var nick_name = document.querySelector("#nick_name").value;

                        var api = Ex.PlurkApi;

                        api.act = "checkTime";
                        api.func = (r)=>{
                            r = JSON.parse(r.response);
                            Ex.flag.PlurkTime = new Date(r.timestamp * 1000);
                            Ex.flag.PlurkDay = `${Ex.flag.PlurkTime.getFullYear()}-${Ex.flag.PlurkTime.getMonth()+1}-${Ex.flag.PlurkTime.getDate()}`;
                        }
                        api.Send();

                        


                        api.plurks = [];
                        document.querySelector("#PlurkList").innerHTML = ``;
                        Ex.flag.page = 1;
                        document.querySelector("#PageBar #page").value = Ex.flag.page;
                        


                        var start = ``,end = ``,ymd = document.querySelectorAll(`select[data-mode="ymdchange"]`);

                        start = `${ymd[3].value}/${ymd[4].value}/${ymd[5].value}`;
                        end = `${ymd[0].value}/${ymd[1].value}/${ymd[2].value}`;

                        if(nick_name==='')
                        {
                            alert(Ex.config.msg.nick_name_err);
                            document.querySelector(`[data-mode="Search"]`).removeAttribute("disabled");
                            return;
                        }

                        if( new Date(start)<new Date(end) )
                        {
                            alert(Ex.config.msg.time_range_err);
                            document.querySelector(`[data-mode="Search"]`).removeAttribute("disabled");
                            return;
                        }


                        if( (((new Date(start) - new Date(end)) / 1000) / 60 / 60 / 24) >= 31 )
                        {
                            alert(Ex.config.msg.time_range_err2);
                            document.querySelector(`[data-mode="Search"]`).removeAttribute("disabled");
                            return;
                        }



                        api.act = "Timeline/getPublicPlurks";
                        api.arg.minimal_data = "true";
                        api.arg.minimal_user = "true";
                        api.arg.nick_name = document.querySelector("#nick_name").value;
                        api.arg.limit = "100";
                        api.arg.only_user = "true";
                        api.mode = "CORS";

                        start = new Date(start).setHours(24+8);
                        end = new Date(end).setHours(8);



                        api.arg.offset = new Date(start).toISOString();

                        
                        var safe = 0;
                        api.func = (r)=>{ 


                            api.plurks = api.plurks||[];
    
                            try{
                                r = JSON.parse(r.response);
                            }
                            catch(err){
                                console.log(end);
                                
                                Ex.func.PlurkList(Ex.PlurkApi.plurks);

                                document.querySelector("#Progress").style.background = `linear-gradient(to right, #0d0 100% , #999 0%)`;

                                document.querySelector(`[data-mode="Search"]`).removeAttribute("disabled");
                                return;
                            }
    
                            if(r.plurks.length===0)
                            {
                                Ex.func.PlurkList(Ex.PlurkApi.plurks);

                                document.querySelector("#Progress").style.background = `linear-gradient(to right, #0d0 100% , #999 0%)`;

                                document.querySelector(`[data-mode="Search"]`).removeAttribute("disabled");
                                return;
                            }
    
                        
                            api.plurks = api.plurks.concat(r.plurks);
                        

                            safe++;
                            if(safe>Ex.config.loop_safe){console.log('loop_safe break');return;}
                            
                            
                            
                            var s = Math.floor(new Date(start).getTime()/1000/60/60/24);
                            var e = Math.floor(new Date(end).getTime()/1000/60/60/24);
                            var p = Math.floor(new Date(api.plurks[api.plurks.length-1].posted).getTime()/1000/60/60/24);

                            var progress = Math.floor( ( s - e - (p - e) ) / ( s - e ) * 100 );


                            document.querySelector("#Progress").innerHTML = Ex.config.msg.Progress(
                                progress,
                                new Date(api.plurks[api.plurks.length-1].posted).toISOString().split("T")[0]
                                );

                            document.querySelector("#Progress").style.background = `linear-gradient(to right, #0d0 ${progress}% , #999 0%)`;




                            if(new Date(api.plurks[api.plurks.length-1].posted).toISOString() >= new Date(end).toISOString())
                            {
                                setTimeout(()=>{
                                    
                                    api.arg.offset = new Date( new Date(api.plurks[api.plurks.length-1].posted) ).toISOString();

                                    Ex.func.DB(`PlurkSearch/nick_name/${nick_name}/${Ex.flag.PlurkDay}`,`add`,(r)=>{

                                        r = r.val()||0;

                                        Ex.flag.NickNameCount = r;

                                        if(r>=Ex.config.max)
                                        {
                                            alert(Ex.config.msg.day_limit(nick_name));

                                            Ex.func.PlurkList(Ex.PlurkApi.plurks);

                                            document.querySelector(`[data-mode="Search"]`).removeAttribute("disabled");
                                            return;
                                        }

                                        Ex.func.DB(`PlurkSearch/XmlCount/${Ex.flag.PlurkDay}`,`add`,(r)=>{

                                            r = r.val()||0;
            
                                            if(r>=Ex.config.XMLmax)
                                            {
                                                alert(Ex.config.msg.xml);
                                                Ex.func.PlurkList(Ex.PlurkApi.plurks);
            
                                                document.querySelector(`[data-mode="Search"]`).removeAttribute("disabled");
                                                return;
                                            }
                                            
            
                                            api.Send();
            
                                        });
            
                                    });                               
                        
                                },Ex.config.loop_sec);
                            }
                            else
                            {
                                Ex.func.PlurkList(Ex.PlurkApi.plurks);
                                
                                document.querySelector(`[data-mode="Search"]`).removeAttribute("disabled");
                            }    
                        }


                        

                        Ex.func.DB(`PlurkSearch/nick_name/${nick_name}/${Ex.flag.PlurkDay}`,`add`,(r)=>{

                            r = r.val()||0;

                            Ex.flag.NickNameCount = r;

                            if(r>=Ex.config.max)
                            {
                                alert(Ex.config.msg.day_limit(nick_name));
                                Ex.func.PlurkList(Ex.PlurkApi.plurks);

                                document.querySelector(`[data-mode="Search"]`).removeAttribute("disabled");
                                return;
                            }

                            Ex.func.DB(`PlurkSearch/SearchCount/${Ex.flag.PlurkDay}`,`add`);

                            Ex.func.DB(`PlurkSearch/XmlCount/${Ex.flag.PlurkDay}`,`add`,(r)=>{

                                r = r.val()||0;

                                if(r>=Ex.config.XMLmax)
                                {
                                    alert(Ex.config.msg.xml);
                                    Ex.func.PlurkList(Ex.PlurkApi.plurks);

                                    document.querySelector(`[data-mode="Search"]`).removeAttribute("disabled");
                                    return;
                                }


                                api.Send();

                            });

                        });



                    break;


                    case "TextPrint":

                        var plurk = Ex.PlurkApi.plurks.filter(o=>{
                            if(o.plurk_id===parseInt(e.target.dataset.plurk_id)) return true;
                        })[0];



                        var text = `${plurk.content_raw}\nhttps://www.plurk.com/p/${parseInt(plurk.plurk_id).toString(36)}`;

                        navigator.clipboard.writeText(text);
                        
                    break;



                    case "PageChange":

                        var path = e.target.dataset.path;
                        var total = Ex.PlurkApi.search_plurks.length;
                        var now_page = parseInt(Ex.flag.page);

                        if(path==="next")
                        {
                            Ex.flag.page = now_page + 1;
                        }
                        else if(path==="prev")
                        {
                            Ex.flag.page = now_page - 1;
                        }


                        if(
                            Ex.flag.page>Math.ceil(total/Ex.config.page_per_count) || 
                            Ex.flag.page*Ex.config.page_per_count<=0) return;


                        document.querySelector("#PageBar #page").value = Ex.flag.page;
                        document.querySelector("#PlurkList").scrollTo(0,0);


                        Ex.func.PlurkList( Ex.PlurkApi.plurks );

                        Ex.func.PageControl();




                    break;

                }

            },
            DB:(path,mode,func)=>{


                switch (mode)
                {
                    case "add":
                        Ex.DB.ref(path).once("value",r=>{

                            r = r.val()||0;

                            Ex.DB.ref(path).set( parseInt(r)+1 );

                        }).then(r=>{

                            if(typeof(func)==="function") func(r);

                        });

                    break;
                }
                

            },
            StorageUpd:()=>{
                localStorage[Ex.id] = JSON.stringify(Ex.flag.local);
                sessionStorage[Ex.id] = JSON.stringify(Ex.flag.session);
            },
            PlurkDate:(IOSDate)=>{

                return `${new Date(IOSDate).getFullYear()}-${new Date(IOSDate).getMonth()+1}-${new Date(IOSDate).getDate()} ${new Date(IOSDate).getHours().toString().padStart(2,'0')}:${new Date(IOSDate).getMinutes().toString().padStart(2,'0')}:${new Date(IOSDate).getSeconds().toString().padStart(2,'0')}`
            }
        },
        ele:{

        },
        DB:{},
        firebase:(url,func)=>{

            if( typeof(firebase)!=='undefined' ) return;

            var firebasejs = document.createElement("script");
            firebasejs.src="https://www.gstatic.com/firebasejs/5.5.6/firebase.js";
            document.head.appendChild(firebasejs);

            var _t = setInterval(() => {
                if( typeof(firebase)!=='undefined' )
                {
                    Ex.DB = firebase;
                    Ex.DB.initializeApp({databaseURL:url});
                    Ex.DB = Ex.DB.database();
                    clearInterval(_t);

                    if(typeof(func)==="function") func();

                }
            },100);

        },
        js:(url_ary)=>{


            for(let i in url_ary)
            {
                setTimeout(()=>{
                    var js = document.createElement("script");
                    js.src = `${url_ary[i]}?s=${new Date().getTime()}`;
                    document.head.appendChild(js);
                },i*200);
            }


            var _t = setInterval(()=>{
                if(typeof(PlurkApi)==="function")
                {
                    Ex.PlurkApi = new PlurkApi();
                    clearInterval(_t);
                }
            },100);
        },
        css:(url_ary)=>{

            for(var src of url_ary)
            {
                var link = document.createElement('link');
                link.href = `${src}?s=${new Date().getTime()}`;
                link.rel = 'stylesheet';
                link.type = 'text/css';
                document.head.appendChild(link);
            }

        },
        init:()=>{

            

            Ex.firebase("https://kfs-plurk-default-rtdb.firebaseio.com/");


            Ex.js(
                ['https://kfsshrimp.github.io/sha1/core-min.js',
                'https://kfsshrimp.github.io/sha1/sha1-min.js',
                'https://kfsshrimp.github.io/sha1/hmac-min.js',
                'https://kfsshrimp.github.io/sha1/enc-base64-min.js',
                'https://kfsshrimp.github.io/js/PlurkApi.js']
            );

            Ex.css(
                ["style.css"]
            )


            Ex.flag.local = JSON.parse(localStorage[Ex.id]||`{}`);
            Ex.flag.session = JSON.parse(sessionStorage[Ex.id]||`{}`);

            Ex.func.StorageUpd();
            
            


            document.body.innerHTML = `
            <div id="SearchBar">
            <input id="nick_name" value="${(location.hostname===``)?"kfsshrimp4":""}" type="text" placeholder="噗浪帳號">

            <select id="y_start" data-group="ymd_start" data-mode="ymdchange" data-event="ChangeEvent">${Ex.func.SelectYMD().y}</select>
            <select id="m_start" data-group="ymd_start" data-mode="ymdchange" data-event="ChangeEvent">${Ex.func.SelectYMD().m}</select>
            <select id="d_start" data-group="ymd_start" data-mode="ymdchange">${Ex.func.SelectYMD().d}</select>
            ~
            <select id="y_end" data-group="ymd_end" data-mode="ymdchange" data-event="ChangeEvent">${Ex.func.SelectYMD().y}</select>
            <select id="m_end" data-group="ymd_end" data-mode="ymdchange" data-event="ChangeEvent">${Ex.func.SelectYMD().m}</select>
            <select id="d_end" data-group="ymd_end" data-mode="ymdchange">${Ex.func.SelectYMD().d}</select>

            <select id="sort" data-mode="sort" data-event="ChangeEvent">${Ex.func.SelectHtml(Ex.config.sort)}</select>
            <select id="porn" data-mode="porn" data-event="ChangeEvent">${Ex.func.SelectHtml(Ex.config.porn)}</select>

            <input data-event="ClickEvent" data-mode="Search" id="Search" type="button" value="搜尋">

            <!--
            <input data-event="ClickEvent" data-mode="TextPrint" id="TextPrint" type="button" value="快速顯示">
            -->
            
            </div>

            <div id="Progress"></div>

            <div id="PlurkList"></div>

            <div id="PageBar">
            <input id="prev" 
            data-event="ClickEvent" 
            data-mode="PageChange" 
            data-path="prev" disabled
            type="button" value="上一頁">

            <input id="page" type="button" value="1">

            <input id="next" 
            data-event="ClickEvent" 
            data-mode="PageChange" 
            data-path="next" disabled
            type="button" value="下一頁">
            </div>`;

            
           
            Ex.func.ChangeEvent();
            Ex.func.ClickEvent();

            Ex.func.Block(1);
            
            

        }
    }

    

    window.onload = ()=>{

        Ex.init();


    }
    

})();