<template>
    <div class="container-fluid m-0 p-0">
        <div class="row justify-content-center no-gutters m-0 p-0">
            <div class="col-md-2">
                <div class="color-picker mb-3" style="display:none;">
                    <label for="color">Set selected Object Color</label>
                    <input type="color" v-model="objectColor" class="form-control" value="" name="color" id="color">
                </div>
               <div style="height:85vh;">
                    <ul class="list-group">
                  <div class="btn-group dropright">
                        <button type="button" class="btn text-left list-group-item-action tool list-group-item dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <span><i class="fas fa-file  mr-2   "></i></span> File
                        </button>
                        <div class="dropdown-menu">
                           <a v-if="user.isAdmin" data-toggle="modal" data-target="#new-canvas-form" href="" class="list-group-item list-group-item-action tool dropdown-item"><span><i class="fas fa-folder-plus mr-2   "></i></span>Create New</a>
                           <a @click.prevent="convertToImage" href="" class="list-group-item list-group-item-action tool dropdown-item"><span><i class="fas fa-save  mr-2  "></i></span>Save</a>
                           <a v-if="user.isAdmin" href="" data-toggle="modal" data-target="#open-recent" class="list-group-item list-group-item-action tool dropdown-item"><span><i class="fas fa-clock mr-2   "></i></span>Open Recent</a>
                           <a v-if="user.isAdmin" href="" data-toggle="modal" data-target="#queueModal" class="list-group-item list-group-item-action tool dropdown-item"><span><i class="fas fa-draw-polygon  mr-2  "></i></span>Draw Requests</a>
                            
                        </div>
                   </div>


        
                    <a href="" @click.prevent="setSelectMode" class="list-group-item list-group-item-action tool active"><span><i class="fas mr-2 fa-arrows-alt    "></i></span>Select</a>
                    
                    <div class="btn-group dropright">
                        <button :disabled="!user.canEdit" type="button" class="btn text-left list-group-item-action tool list-group-item dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <span><i class="fas fa-hand-point-up  mr-2  "></i></span> Draw
                        </button>
                        <div class="dropdown-menu">
                            <a href="" @click.prevent="freeDraw('brush')" class="list-group-item list-group-item-action tool dropdown-item"><span><i class="fas fa-paint-brush  mr-2  "></i></span> Brush</a>
                            <a href="" @click.prevent="freeDraw('pen')" class="list-group-item list-group-item-action tool dropdown-item"><span> <i class="fas fa-pen   mr-2 "></i> </span> Pen</a>
                        </div>
                   </div>
                    <div class="btn-group dropright">
                        <button :disabled="!user.canEdit" type="button" class="btn list-group-item-action list-group-item tool dropdown-toggle text-left" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <span class=""><i class="fas fa-shapes  mr-2  "></i></span>Shapes
                        </button>
                        <div class="dropdown-menu">
                                <li><a href="" @click.prevent="drawCircle" class="dropdown-item"><i class="fas fa-circle m-2   "></i> Circle</a></li>
                                <div class="dropdown-divider"></div>
                                <li><a href="" @click.prevent="drawRectangle" class="dropdown-item"> <i class="fas m-2 fa-vector-square    "></i> Rectangle</a></li>
                                <div class="dropdown-divider"></div>
                                <li><a href="" @click.prevent="drawTriangle" class="dropdown-item"> <i class="fas m-2 fa-caret-up    "></i> Triangle</a></li>
                            
                        </div>
                   </div>
                    <a href="" :class="{disabled: !user.canEdit}" class="list-group-item list-group-item-action tool"><span><i class="mr-2 fas fa-text-width    "></i></span> Text</a>
                    <a href="" :class="{disabled: !user.canEdit}" @click.prevent="drawLine" class="list-group-item list-group-item-action tool"><span><i class="fas mr-2 fa-chart-line    "></i></span> Line </a>
                    <a href="" :class="{disabled: !user.canEdit}" @click.prevent="undoRedo('undo')" class="list-group-item list-group-item-action tool"><span><i class="fas fa-undo  mr-2  "></i></span>Undo</a>
                    <a href="" :class="{disabled: !user.canEdit}" @click.prevent="undoRedo('redo')" class="list-group-item list-group-item-action tool"><span><i class="fas fa-redo mr-2   "></i></span>Redo</a>
                    <a href="" :class="{disabled: !user.canEdit}" @click.prevent="clearCanvas()" class="list-group-item list-group-item-action tool"><span><i class="fas fa-trash  mr-2 text-danger "></i></span>Clear</a>
                    <a href="" :class="{disabled: user.canEdit}" @click.prevent="sendRequest" class="list-group-item list-group-item-action tool" ><span><i class="fas fa-draw-polygon mr-2   "></i></span>Request Drawing</a>
                    
                </ul>
               </div>
            </div>
            <div class="col-md-8">
                <div class="card" style="height:86vh;">
                    <div class="card-body p-0 canvas-container">
                        <canvas width="100" height="100" class="gridCanvas" id="mainCanvas"></canvas>
                    </div>
                </div>
            </div>
             <div class="col-md-2">
               <div style="height:85vh;">
                    <ul class="list-group active-users">
                        <li class="list-group-item"><i class="fas text-success fa-users mr-1"></i><strong class="text-info">{{usersCount}} Active Users</strong></li>
                        <li v-for="user in currentUsers" :key="user.id"  class="list-group-item"> <span><a v-if="user.isAdmin == 1" href="" title="Admin" class="btn"><i class="fas text-success mr-2 fa-circle dot"></i></a><a v-else title="Member" href="" class="btn"><i class="fas text-info mr-2 fa-circle dot"></i></a></span>{{user.name}}
                          <a :title="user.name + ' can edit'" v-show="user.canEdit" class="btn float-right p-0" href=""><i class="fas fa-check text-info  "></i></a>
                        </li>
                       
                        
                </ul>
               </div>
            </div>
        </div>

      
      <!-- Modal -->
      <div class="modal fade" id="queueModal" tabindex="-1" role="dialog" aria-labelledby="modelTitleId" aria-hidden="true">
        <div class="modal-dialog modal-lg" role="document">
          <div class="modal-content">
              <div class="modal-header">
                  <h5 class="modal-title">Drawing Users Management</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                    </button>
                </div>
            <div class="modal-body">
              <div class="container-fluid">
                <div class="card-header">
                 <strong class="text-info">Drawing members</strong>
              </div>
               <table class="table table-striped">
                 <thead>
                        <th>#</th>
                        <th>Member</th>
                        <th>Action</th>
                    </thead>
                    <tbody>
                        <tr v-for="(user,index) in getActiveUsers" :key="user.id">
                            <td>{{index + 1}}</td>
                            <td>{{user.name}}</td>
                            <td v-if="!user.isAdmin"><a href="" @click.prevent="terminateDrawSession(user.id,drawQueue.length > 0 ? drawQueue[0].id : 0)" class="btn btn-primary btn-sm"><span><i class="fas fa-check mr-2   "></i></span>Terminate</a></td>
                            <td v-else><a href="" @click.prevent="" class="btn btn-success btn-sm"><span><i class="fas fa-lock mr-2   "></i></span>Admin</a></td>
                        
                        </tr>
                    </tbody>
                    <tfoot>
                        <th>#</th>
                        <th>Member</th>
                        <th>Action</th>
                    </tfoot>
               </table>
              </div>
              <div class="card-header">
                 <strong class="text-info">Waiting members</strong>
              </div>
              <table class="table table-striped">
                 <thead>
                        <th>#</th>
                        <th>Member</th>
                        <th>Action</th>
                    </thead>
                    <tbody>
                        <tr v-for="(user,index) in drawQueue" :key="user.id">
                            <td>{{index + 1}}</td>
                            <td>{{user.name}}</td>
                            <td><a href="" class="badge badge-success">waiting in the queue</a></td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <th>#</th>
                        <th>Member</th>
                        <th>Action</th>
                    </tfoot>
               </table>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-danger" data-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Modal -->
      <div class="modal fade" id="open-recent" tabindex="-1" role="dialog" aria-labelledby="modelTitleId" aria-hidden="true">
        <div class="modal-dialog modal-lg" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Recent drawing</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
              <RecentDrawing @openrecent="openRecent"/>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-danger" data-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>

      
      <!-- Modal -->
      <div class="modal fade" id="new-canvas-form" tabindex="-1" role="dialog" aria-labelledby="modelTitleId" aria-hidden="true">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Modal title</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <form @submit.prevent="createNewCanvas(name)">
               <div class="modal-body">
                 <div class="form-group">
                   <label for="name">What is the name of the whiteboard</label>
                   <input type="text" v-model="name" class="form-control" name="name" id="name" placeholder="eg.circuit design">
                 </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-danger" data-dismiss="modal">Close</button>
                  <button type="submit" class="btn btn-primary">Create</button>
                </div>
            </form>
          </div>
        </div>
      </div>

    </div>
  
</template>

<script>
import 'fabric-history';
import { fabric } from 'fabric'
import methods from './methods'
import RecentDrawing from './RecentDrawing'
    export default {
        data() {
            return {
                msg:'turtututu',
                canvas: '',
                usersCount: null,
                currentUsers: [],
                objectColor: '#ccc',
                activeObject:null,
                objectId:0,
                canvasStates: [],
                canvasMods: 0,
                sendBroadcast: true,
                gridGroup:null,
                drawQueue: [],
                name: ''
            }
        },
        props:['user'],
        components:{
          RecentDrawing
        },
        computed: {
          getActiveUsers(){
            return this.currentUsers.filter((user)=>user.canEdit);
          }
        },
        methods:{...methods},
        mounted() {
            Echo.private('draw')
             .listen('DrawEvent',(e)=>{
                this.clearListeners();
                this.loadJson(e.canvas,e.id);
                this.canvasEventListeners();
                this.updateCanvasStates(true);
                // this.updateWhiteboard(this.user);
                
                console.log(`lenght state is : ${this.canvasStates.length}`);
            });

            Echo.join('draw')
                .here((users)=>{
                    this.usersCount = users.length;
                    this.currentUsers = users;
                    setTimeout(()=>{
                      this.checkAdminPresence(this.currentUsers);
                    },30000)
                    console.log(this.currentUsers)
                })
                .joining((user)=>{
                    this.usersCount += 1;
                    this.$toaster.success(`${user.name} has joined the group`);
                    this.currentUsers.push(user);
                })
                .leaving((user)=>{
                    this.usersCount -= 1;
                    this.$toaster.info(`${user.name} has left the group`);
                    this.currentUsers = this.currentUsers.filter((userObj)=>user !== userObj);
                    this.checkAdminPresence(this.currentUsers);
                });

            Echo.private('undoredo').listen('UndoRedoEvent',(e)=>{
                if(e.action === 'redo'){
                    this.undoRedo('redo', true)
                }else if(e.action === 'undo'){
                    this.undoRedo('undo', true);
                }else if(e.action == 'clear'){
                    this.clearCanvas(true);
                }
            
            });

            Echo.private('drawrequest').listen('DrawRequestEvent',(e)=>{
              if(this.user.isAdmin){
                this.addRequestToTheQueue(e.user);
              }
            });

            Echo.private('terminate').listen('TerminateRequestEvent',(e) => {
              e.users.forEach(user => {
                if(this.user.id === user.id){
                 //window.location.reload(true); 
                 window.stop();
                 window.location.href = window.location.href;
              }
              });
              
            });

            Echo.private('newdraw').listen('NewDrawEvent',(e)=>{
                this.newWhiteboard(this.user,e.name);
                window.location.href = window.location.href;
                if(!this.user.isAdmin){
                   this.$toaster.info(` Admin has created a new drawing canvas.`);
                }
              });

            Echo.private('openrecent').listen('OpenRecentEvent',(e)=>{
              window.location.href = window.location.href;
                if(!this.user.isAdmin){
                   this.$toaster.info(` Admin has opened a recent drawing canvas.`);
                }
            })


            this.getCanvas();
            this.canvasEventListeners();
            this.setActiveLink();
            this.setColor();
            this. loadCurrentState();
        }
    }
</script>

<style scoped>
   .canvas-container{
    overflow:hidden;
    background:#F2F2F2;
    width: 100%;
    height: 100%;
   }

   .dot{
       font-size: 0.7em;
   }

   .active-users{
       height: 85vh;
       overflow-y: auto;
   }

   .tooltip {
  display: block !important;
  z-index: 10000;
}

.tooltip .tooltip-inner {
  background: black;
  color: white;
  border-radius: 16px;
  padding: 5px 10px 4px;
}

.tooltip .tooltip-arrow {
  width: 0;
  height: 0;
  border-style: solid;
  position: absolute;
  margin: 5px;
  border-color: black;
}

.tooltip[x-placement^="top"] {
  margin-bottom: 5px;
}

.tooltip[x-placement^="top"] .tooltip-arrow {
  border-width: 5px 5px 0 5px;
  border-left-color: transparent !important;
  border-right-color: transparent !important;
  border-bottom-color: transparent !important;
  bottom: -5px;
  left: calc(50% - 5px);
  margin-top: 0;
  margin-bottom: 0;
}

.tooltip[x-placement^="bottom"] {
  margin-top: 5px;
}

.tooltip[x-placement^="bottom"] .tooltip-arrow {
  border-width: 0 5px 5px 5px;
  border-left-color: transparent !important;
  border-right-color: transparent !important;
  border-top-color: transparent !important;
  top: -5px;
  left: calc(50% - 5px);
  margin-top: 0;
  margin-bottom: 0;
}

.tooltip[x-placement^="right"] {
  margin-left: 5px;
}

.tooltip[x-placement^="right"] .tooltip-arrow {
  border-width: 5px 5px 5px 0;
  border-left-color: transparent !important;
  border-top-color: transparent !important;
  border-bottom-color: transparent !important;
  left: -5px;
  top: calc(50% - 5px);
  margin-left: 0;
  margin-right: 0;
}

.tooltip[x-placement^="left"] {
  margin-right: 5px;
}

.tooltip[x-placement^="left"] .tooltip-arrow {
  border-width: 5px 0 5px 5px;
  border-top-color: transparent !important;
  border-right-color: transparent !important;
  border-bottom-color: transparent !important;
  right: -5px;
  top: calc(50% - 5px);
  margin-left: 0;
  margin-right: 0;
}

.tooltip[aria-hidden='true'] {
  visibility: hidden;
  opacity: 0;
  transition: opacity .15s, visibility .15s;
}

.tooltip[aria-hidden='false'] {
  visibility: visible;
  opacity: 1;
  transition: opacity .15s;
}
 
  
</style>