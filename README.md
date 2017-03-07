# Whiteboard   电子白板 1.0
---
##目录
* [需求分析](#需求分析 )
* [实现功能](#实现功能 )
* [技术架构](#技术架构 )
* [开发工具](#开发工具 )
* [项目语言](#项目语言 )


##阶段目标
- [x] 需求分析
- [x] 系统设计
- [ ] 详细设计
- [ ] 编码
- [ ] 测试


##需求分析

    主要实现一个在线电子白板：可以用鼠标模拟画笔在绘图区进行绘制，可以支持多人连线在一个房间里文字聊天，甚至互动。
      
    目前想到的，服务器和客户端之间的连接应该要用到WebSocket技术；
    从软件程序着手，系统涉及到了前端交互与后端的数据连接。
    基于目前技术栈限与JAVA(J2EE框架)、Html、CSS、JAVASCRIPT(可能选用AngularJs,React Native,BootStrap)，
    先用这套方案对项目系统进行设计，待未来有更好的解决方案再做分支。

## 实现功能

### 服务器端
 1.  创建服务器端口号供客户端连接（长连接）
  -  支持区分身份（1.0版本暂定房主才可绘制图形）
  -  支持接收消息并转发给对应房间的用户

### 浏览器端
 1.  可选择创建房间，随机生成房间号及房主ID
  -  可选择加入房间，随机生成访客ID
  -  编写绘图界面，编写绘图面板，可绘制基本图形
  -  接收服务端传来的图形信息，同步绘制在面板中

## 技术架构
###客户端与服务器交互示意图 
![流程图](images/diagram-1.jpg?raw=true)

### 后端架构；

#### 主要业务：在线创建房间和多用户加入房间，并且将同属于一个房间中的角色、人员进行一定的通讯绑定。
#### 日志设计：利用Log4J打印日志，方便追踪过程、查看问题。
#### 实体设计：这里结合继承、封装、多态的概念，用到的设计模式只有代理模式，对主要的几个实体进行设计。

1. **用户实体**：设计一个用户的属性和开放的接口（接口不一定要实现）；用户的身份识别可以利用客户端网页的Cookies实现，用户间信号的传递存储可以统一由服务端进行转发。通讯的**信息内容**可以由服务器**运行内存**保管。
>  有必要可以研究UML建模工具比如（https://www.processon.com/diagrams）
    - 用户属性：用户ID，用户昵称，用户角色，钥匙（权限）；
    - 用户接口：转发绘图信息()，接收绘图信息()，<s>修改用户信息()</s>，获取用户信息()，加入房间()，退出房间()

2. **房间实体**：房间实体的设计为了最大程度解耦，类中**不应该**包含任何和自身无关的属性，比如当前房间中的用户列表、当前房间中的绘图数据；设计简洁便于日后继承和扩展。
    - 房间属性：房间ID，房间名，房间创建日期，房间状态，房间人数上限；
    - 房间接口：<s>修改房间信息()，修改房间状态()，</s>开启房间()，关闭房间()，查询所有已存在房间()，清理房间()，接收新用户()，<s>移出用户()</s>；

3.  <s>**用户房间登记**：记录哪个用户当前在哪个房间;设计模型为一个单例实体，功能角色为一个中间代理人（房产中介？），所有的用户都通过该类，查看现有哪些房间，哪些房间可以加入，哪些房间人满；
    - 登记属性：当前已登记房间的用户（未登记的用户不归其管辖），当前所有房间，用户房间登记信息（哪个用户在哪个房间）
    - 登记接口：查看所有房间()，帮用户登记进入房间()，帮用户登记离开房间()，关闭房间()，清理房间()
</s>

4. **钥匙**：普通用户和管理员用户对房间的操作是不同的，将它设计成一个基础钥匙类用于各种钥匙进行继承，不同的用户角色所用户的钥匙有不同的功能，这里先列出一把钥匙可能拥有的所有功能：
    - 钥匙属性：钥匙状态，钥匙类型，钥匙对应的房间（可拟定万能钥匙能进所有房间）
    - 钥匙接口：检查是否有某个房间的权限()，

5. **信息板**：所有的聊天数据，绘图数据都可以存入信息板，将其设计为一个装所有数据包的容器。每个房间<s>可以不止有一个信息板</s>只有一个信息板，一个信息板一次只能放在一个房间使用。信息板里装的是一个个**数据包**，每个客户端的页面显示主要是通过得到**信息板后**在页面上把内容重新绘制出来。
    - 信息板属性：信息板状态，信息板类型（比如是否可擦写），信息板当前对应的房间
    - 信息板接口：添加新数据（），擦去指定数据（），清空信息板，移动信息板到其它房间（），销毁信息板（），获取信息板数据（）；

6. **物资管理员**：所有用户（包括管理员）想要获取某个房间中的信息板，不能自己获取，必须通过物资保管员借取（有的对象是不用归还的，比如信息板），这里所有的信息数据、物资都由保管员进行统一发放管理，当然除了信息板的管理，其它可分配的资源也可以由物资保管员继承处理。
    - 物资保管员属性：保管的所有对象（这里用泛型实现，连用户都可以当成物资放进来），
    - 物资保管员接口：添加新物资（比如将某个信息板添加给某个房间），借出物资（比如从某个房间借出信息板），转交物资（比如更改某信息板的所有权），修改物资信息（比如借出的信息板被修改后再放回房间）；> 这里物资管理员有一项重要功能，修改物资，所有的用户发出的绘图信息在信息板上绘图的这一项功能，多个用户可以同时操作一个信息板，为了避免不同用户画的信息ID重复，或者前后操作发生冲突，统一由物资管理员代笔（物资管理员好像不改管这种事？暂时想不到怎么实现多个内容先后顺序冲突的问题）；

7.  信息数据包：无论绘图还是聊天还是表情包还是特殊的动作，全都继承扩展自该实体，信息板上的一条条图文形状聊天本质上是一个信息数据包；
    - 数据包属性：数据包来源用户，数据包状态（显示、隐藏、撤回），数据包类型（图形/聊天文字）
    - 数据包接口：删除（），修改（），展现（不同类型的数据包的展现绘图方式，在这个方法里各自实现），


### 服务端框架的设计

#### SpringBoot

> Spring MVC是Spring核心框架的一个模块，它是一个Web框架，和它类似像Struts。它解决的问题领域是网站应用程序或者服务开发——URL路由、Session、模板引擎、静态Web资源等等。而Spring Boot是这几年微服务概念流行后，Spring开发的一套快速开发Spring应用的框架。它本身并不提供Spring框架的核心特性以及扩展功能，只是用于快速、敏捷地开发新一代基于Spring框架的应用程序。也就是说，它并不是用来替代Spring的解决方案，而是和Spring框架紧密结合用于提升Spring开发者体验的工具。同时它集成了大量常用的第三方库配置（例如Jackson, JDBC, Mongo, Redis, Mail等等），Spring Boot应用中这些第三方库几乎可以零配置的开箱即用（out-of-the-box），大部分的Spring Boot应用都只需要非常少量的配置代码，开发者能够更加专注于业务逻辑。

#### Spring Boot框架中使用WebSocket实现消息推送
http://www.ctolib.com/topics-103935.html

> WebSocket为浏览器和服务器之间提供了双工异步通信功能，也就是说我们可以利用浏览器给服务器发送消息，服务器也可以给浏览器发送消息，目前主流浏览器的主流版本对WebSocket的支持都算是比较好的，但是在实际开发中使用WebSocket工作量会略大，而且增加了浏览器的兼容问题，这种时候我们更多的是使用WebSocket的一个子协议stomp，利用它来快速实现我们的功能。OK，关于WebSocket我这里就不再多说，我们主要看如何使用，如果小伙伴们有兴趣可以查看这个回答来了解更多关于WebSocket的信息WebSocket 是什么原理？为什么可以实现持久连接。

### 页面端框架的设计


#### 主要内容

- 页面布局（自适应）
- 函数布局（MVC结构）
    -  Model层存放所有的信息数据（模型层，房间信息、用户列表、信息板）
    -  View层只做页面实时的展示（展示层，包括接受到的数据版信息，用户当前实时绘制的内容）
    -  Controller（控制层，登入房间，查看房间，绘制画笔时发送数据包，接受新数据包等，作为Model和View的中间衔接）

#### Html5 WebSocket

看到一篇知乎专栏 [WebSocket 浅析](https://zhuanlan.zhihu.com/p/25592934)

>   WebSocket API
WebSocket 对象提供了一组 API，用于创建和管理 WebSocket 连接，以及通过连接发送和接收数据。浏览器提供的WebSocket API很简洁，调用示例如下：
var ws = new WebSocket('wss://example.com/socket'); // 创建安全WebSocket 连接（wss）
 ws.onerror = function (error) { ... } // 错误处理
 ws.onclose = function () { ... } // 关闭时调用
 ws.onopen = function () { // 连接建立时调用
   ws.send("Connection established. Hello server!"); // 向服务端发送消息
 }
 ws.onmessage = function(msg) { // 接收服务端发送的消息
   if(msg.data instanceof Blob) { // 处理二进制信息 processBlob(msg.data);
   } else {     processText(msg.data); // 处理文本信息
   }
 }

#### Vue.js （国产轻量类似Angularjs）

> Vue.js（读音 /vjuː/, 类似于 view） 是一套构建用户界面的 渐进式框架。与其他重量级框架不同的是，Vue 采用自底向上增量开发的设计。Vue 的核心库只关注视图层，并且非常容易学习，非常容易与其它库或已有项目整合。另一方面，Vue 完全有能力驱动采用单文件组件和 Vue 生态系统支持的库开发的复杂单页应用。
Vue.js 的目标是通过尽可能简单的 API 实现响应的数据绑定和组合的视图组件。

#### React Native （强大的多终端生态圈）

> React Native使你能够在Javascript和React的基础上获得完全一致的开发体验，构建世界一流的原生APP。
React Native着力于提高多平台开发的开发效率 —— 仅需学习一次，编写任何平台。(Learn once, write anywhere)
Facebook已经在多项产品中使用了React Native，并且将持续地投入建设React Native。



##开发工具 
- SublimeText 3
- Eclipse


##项目语言
- JAVA
- Html5
