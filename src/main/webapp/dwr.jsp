<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%
    String path = request.getContextPath();
    String basePath = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort() + path ;
%>
<!DOCTYPE HTML>
<html>
<head>
    <base href="<%=basePath%>">
    <title>dwrTest</title>
    <script type="text/javascript" src="<%=basePath%>/dwr/util.js"></script>
    <script type="text/javascript" src="<%=basePath%>/dwr/engine.js"></script>
    <script type="text/javascript" src="<%=basePath%>/dwr/interface/DwrPush.js"></script>

</head>
<body>
    <div class="show" style="height: 100px;border: 1px solid saddlebrown">

    </div>
    <input type="text" name="msg" class="msg" value="">
    <input type="button" class="sign" name="button" value="测试" >
</body>
<script type="text/javascript" src="<%=basePath%>/res/jquery-3.2.1.min.js"></script>
<script type="text/javascript" src="<%=basePath%>/res/ij-1.0.0.js"></script>
<script type="text/javascript">
    $(function(){
        dwr.engine.setActiveReverseAjax(true);
        $(".sign").click(function(){
            DwrPush.send( $(".msg").val() );
        });
    })

    function callback( msg ){
        $(".show").append($("<p>"+ msg +"</p>"));
    }

</script>
</html>
