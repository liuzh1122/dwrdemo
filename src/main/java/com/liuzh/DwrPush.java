package com.liuzh;

import org.directwebremoting.ScriptBuffer;
import org.directwebremoting.WebContext;
import org.directwebremoting.WebContextFactory;
import org.directwebremoting.proxy.dwr.Util;

import java.util.Collection;

/**
 * Created by liuzh on 2017/7/14.
 */
public class DwrPush {
    public void send(String msg){
        WebContext webContext = WebContextFactory.get();
        Collection collection = webContext.getAllScriptSessions();
        ScriptBuffer sb = new ScriptBuffer();
        sb.appendScript("callback(\"");
        sb.appendScript( msg );
        sb.appendScript("\")");
        Util util = new Util( collection );
        util.addScript(sb);
        System.out.println("新消息： " + msg);
    }
}
