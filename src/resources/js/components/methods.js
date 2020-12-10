export default {

        getCanvas(){
            // var canvas = document.getElementById('mainCanvas');
            var canvas = new fabric.Canvas('mainCanvas', { selection: false });
            this.canvas = canvas;
            this.drawGrid();
            this.updateCanvasStates(true);
        },

        // Drawing the grid
        drawGrid () {
            var grid = 50;
            var unitScale = 10;
            var canvasWidth =  100 * unitScale;
            var canvasHeight = 100 * unitScale;

            this.canvas.setWidth(canvasWidth);
            this.canvas.setHeight(canvasHeight);

            var gridLines = [];

            for (var i = 0; i < (canvasWidth / grid); i++) {
            gridLines.push(new fabric.Line([ i * grid, 0, i * grid, canvasHeight], 
                { type:'line', stroke: '#ccc', selectable: false }));
            gridLines.push(new fabric.Line([ 0, i * grid, canvasWidth, i * grid], 
                { type: 'line', stroke: '#ccc', selectable: false }));
             }
            this.gridGroup = new fabric.Group(gridLines, {
                selectable: false,
                evented: false
              })
              this.gridGroup.addWithUpdate();
              this.canvas.add(this.gridGroup);
        },
      //  Removing the grid
        removeGrid() {
            this.gridGroup && this.canvas.remove(this.gridGroup);
            this.gridGroup = null;
          },

          setActiveLink(){
              let links = document.querySelectorAll('.tool');
              links.forEach((tool)=>{
                  tool.addEventListener('click',(e)=>{
                      e.preventDefault();
                      if(tool.innerText.trim() == 'Text'){
                         this.addTextBox();
                      }
                      this.removeActiveLink(links);
                      tool.classList.add('active');
                  })
              })
          },
         removeActiveLink(links){
             links.forEach((link)=>{
                 link.classList.remove('active');
             })
         },

        //  Fabric free drawing

        freeDraw(type){
            if(type === 'pen'){
               this.canvas.freeDrawingBrush.width = 1;
            }else{
                this.canvas.freeDrawingBrush.width = 10;
            }
            this.canvas.isDrawingMode = 1;
            this.canvas.freeDrawingBrush.color = "purple";
            this.canvas.renderAll();
        },

        removeDrawMode(){
            this.canvas.isDrawingMode = 0;
        },

        setSelectMode(){
            this.removeDrawMode();
        },

         // Fabric js Text
         addTextBox(){
            this.removeDrawMode();
            var text = new fabric.IText('Hello world From Fabric JS', {
                        width:250,
                        cursorColor :"blue",
                        top:10,
                        left:10,
                        fontSize:12,
                        fill:'blue',
                        id: new Date().getUTCMilliseconds(),
                    });
                    this.removeObject(text.id);
            this.canvas.add(text)
         },
         //  Fabric js Circle
         drawCircle(){
           this.removeDrawMode();
           var circle = new fabric.Circle({radius: 100,
             fill: '#ccc',
             stroke: 'grey',
             top:100,
             left: 100,
             strokeWidth: 3,
             originX: 'center', 
             originY: 'center' ,
             id: new Date().getUTCMilliseconds(),
           });
           this.removeObject(circle.id);
           this.canvas.add(circle);
         },
        

        //  Fabric js Rectangle
        drawRectangle(){
           this.removeDrawMode();
           var rectangle = new fabric.Rect({
               width:100,
               height:70,
               fill: '#ccc',
               stroke: 'grey',
               left: 10,
               top:20,
               id: new Date().getUTCMilliseconds(),
           })
           this.removeObject(rectangle.id);

           this.canvas.add(rectangle);
        },
        //  Fabric js Triangle
        drawTriangle(){
            this.removeDrawMode();
            var triangle = new fabric.Triangle({
                width:100,
                height:70,
                fill: '#ccc',
                stroke: 'grey',
                left: 10,
                top:20,
                id: new Date().getUTCMilliseconds(),
            });
            this.removeObject(triangle.id);
            this.canvas.add(triangle);
        },

        // Fabric js Line

        drawLine(){
            this.removeDrawMode();
            var line  = new fabric.Line([50, 100, 200, 200],{
               id: new Date().getUTCMilliseconds(),
               stroke: 'red',
               left: 170,
               top:150,
            });
            this.removeObject(line.id);
            this.canvas.add(line);
        },

        // Clear canvas
        clearCanvas(isFromEvent=false){
            this.clearListeners();
            this.canvas.clear();
            this.drawGrid();
            if(!isFromEvent){
                console.log('cleared')
                this.undoRedo('clear');
            }
            this.canvasEventListeners();
        },

        canvasEventListeners(){

            var colorPicker = document.querySelector('.color-picker')

            var vm = this;
            this.canvas.on('object:added', function(e) { 
                if(e.target.type !== 'path'){
                    vm.broadCastEvent(e.target, e.target.id);
                    vm.updateCanvasStates(true);
                    vm.updateWhiteboard();
                }
                });

            this.canvas.on('object:removed', function(e) { 
                        vm.broadCastEvent(e.target, e.target.id);
                        vm.updateWhiteboard();

                    });
            this.canvas.on('object:modified', function(e) {

                console.log('hello there modified');
                console.log(e.id);
                vm.broadCastEvent(e.target, e.target.id);
                vm.updateCanvasStates(true);
                vm.updateWhiteboard();
            });
            this.canvas.on('selection:created', function (e) {
                colorPicker.style.display = 'block';
                vm.activeObject = vm.getSelection();
                vm.objectId =e.target.id;
                console.log(e.target.id);
                 
                

            });
            this.canvas.on('selection:cleared', function () {
             colorPicker.style.display = 'none';
            });

            this.canvas.on("path:created", function(opt){
                opt.path.id = new Date().getUTCMilliseconds()
                console.log('Path created, ' + opt.path.id);
                vm.broadCastEvent(opt.path, opt.path.id);
                vm.updateCanvasStates(true);
                vm.updateWhiteboard();
              });

        },

        setColor(){
             document.getElementById('color').addEventListener('change',()=>{
                   console.log("Color changed");
                   console.log(this.activeObject);
                   this.activeObject.set("fill", this.objectColor)
                   this.broadCastEvent(this.activeObject,this.objectId)
                   this.canvas.renderAll()
                });
        },

        getSelection(){
            return this.canvas.getActiveObject() == null ? this.canvas.getActiveGroup() : this.canvas.getActiveObject()
        },

        broadCastEvent(canvasObject, id){
            axios.post('/draw',{canvas:JSON.stringify(canvasObject.toObject(['id'])),id:id}).then((data)=>{
                                
                });
        },

        loadJson(stringJson,id){
            // Parse JSON and add objects to canvas
            this.removeObject(id);
            var vm = this;
            var jsonObj = JSON.parse(stringJson);
            fabric.util.enlivenObjects([jsonObj], function (enlivenedObjects) {
                // console.log(enlivenedObjects);
                vm.clearListeners();
                enlivenedObjects.forEach(function (obj, index) {
                     vm.canvas.setActiveObject(obj)
                     vm.canvas.add(obj);
                });
                vm.canvas.renderAll();
                vm.canvasEventListeners();
            });
        },

        removeObject(id){
            var vm = this;
            this.canvas.getObjects().forEach(function(object) {
                if(object.id === id) {
                   console.log(`id is ${object.id}`)
                   vm.canvas.remove(object);
                }

                
            })
        },

        undoRedo(action, isEcho = false){
           if(action === 'undo'){
            if(!isEcho){
                this.sendUndoRedoRequest('undo');
            }
            if (this.canvasMods < this.canvasStates.length - 1) {
                console.log(`mod is ${this.canvasMods}`)
                this.canvas.clear().renderAll();
                this.clearListeners();
                this.canvas.loadFromJSON(this.canvasStates[this.canvasStates.length - 1 - this.canvasMods - 1]);
                this.canvasEventListeners();
                this.canvas.renderAll();
                this.canvasMods += 1;
            }
            }else if(action === 'redo'){
               console.log(`Canvas mod is ${this.canvasMods}`);
            if(!isEcho){
                this.sendUndoRedoRequest('redo');
             }
            if (this.canvasMods > 0) {
                this.canvas.clear().renderAll();
                this.clearListeners();
                this.canvas.loadFromJSON(this.canvasStates[this.canvasStates.length - 1 - this.canvasMods + 1]);
                this.canvasEventListeners();
                this.canvas.renderAll();
                this.canvasMods -= 1; 
            }
           }else if(action === 'clear'){
            if(!isEcho){
                this.sendUndoRedoRequest('clear');
             }
           }

        },

        updateCanvasStates(savehistory) {
            if (savehistory === true) {
                var myjson = JSON.stringify(this.canvas);
                this.canvasStates.push(myjson);
            }
        },

        sendUndoRedoRequest(action){
           axios.post('/undoredo',{action:action}).then((n)=>{
               console.log("sent")
           });
        },

        clearListeners(){
            this.canvas.off('object:added');
            this.canvas.off('object:removed');
            this.canvas.off('object:modified');
            this.canvas.off('path:created');
        },

        // Save canvas as image

        convertToImage() {
            this.canvas.forEachObject(object => {
                object.selectable = false;
                object.evented = false;
            });  
            let downloadLink = document.createElement('a');
            downloadLink.setAttribute('download', 'CanvasAsImage.png');
            let canvas = document.getElementById('mainCanvas');
            canvas.toBlob(function(blob) {
            let url = URL.createObjectURL(blob);
            downloadLink.setAttribute('href', url);
            downloadLink.click();
            });
          },


        //   Check if admin exists

        checkAdminPresence(users){
            var isAdmin = users.filter((user) => user.isAdmin).length > 0 ;
            if(!isAdmin){
                window.location.href ='/vote';
            }else{
                //this.newWhiteboard(this.user);
            }
        },


        // Update whiteboar state

        newWhiteboard(user,name){
            if(user.isAdmin){
                this.clearListeners();
                this.canvas.clear();
                this.drawGrid();
                this.canvasEventListeners();

                axios.post('/whiteboard',{name:name,canvas:JSON.stringify(this.canvas.toObject(['id']))}).then(()=>{
                    console.log('Canvas created successfully')
                }).catch((error)=>{
                    console.log(error.message);
                })
            }
        },

        // update whiteboard

        updateWhiteboard(){
               axios.post('/update/whiteboard',{canvas:JSON.stringify(this.canvas.toObject(['id']))}).then(()=>{
                console.log('Canvas updated successfully')
            }).catch((error)=>{
                console.log(error.message);
            })
           
        },

        // load current state

        loadCurrentState(){
            // if(!this.user.isAdmin){
                this.clearListeners();
                axios.get('/currentstate').then((data)=>{
                    this.canvas.clear().renderAll();
                    var jsonObj = JSON.parse(data.data.canvas);
                    console.log(jsonObj);
                    let vm = this;
                    fabric.util.enlivenObjects(jsonObj.objects, function (enlivenedObjects) {
                        // console.log(enlivenedObjects);
                        vm.clearListeners();
                        vm.drawGrid();
                        enlivenedObjects.forEach(function (obj, index) {
                            console.log(`object at ${index +1} is of type ${obj.get('type')} and id is ${obj.id}`);
                            if(obj.get('type') !== 'group'){
                                vm.canvas.setActiveObject(obj)
                                vm.canvas.add(obj);
                            }
                            
                        });
                        vm.canvas.renderAll();
                        vm.canvasEventListeners();
                    });
                    // console.log(data.data.canvas)
                }).catch((error)=>{
                    console.log(error.message);
                })
                this.canvasEventListeners();
            // }
        },

        // Request to draw
        sendRequest(){
           this.$Progress.start();
           axios.post('/drawrequest').then(()=>{
               this.$swal('Sent','Request submitted successfully !!!','success');
               this.$Progress.finish();
           }).catch((error)=>{
               this.$Progress.fail();
               this.$swal('Sorry !',error.message,'error');
           })
        },

        terminateDrawSession(id,id2){
            this.$Progress.start();
            if(this.drawQueue.length < 1){
                this.$swal('Sorry','There is no user in the drawing queue !!!','info');
            }else{
                axios.post(`/terminate/${id}/${id2}`).then((data)=>{
                    let user = data.data;
                    this.currentUsers.forEach(cuser => {
                        if(cuser.id === user.id){
                            user.canEdit = false;
                        }
                    });
                this.approveDrawRequest();
                    this.$swal('Terminated','Session terminated successfully !!!','success');
                    this.$Progress.finish();
                }).catch((error)=>{
                    this.$Progress.fail();
                    this.$swal('Sorry !',error.message,'error');
                })
            }
            
        },

        addRequestToTheQueue(user){
            this.drawQueue.push(user)
        },

        // approve draw request
        approveDrawRequest(){
            this.drawQueue.shift();
        },

        createNewCanvas(name){
            this.$Progress.start();
            axios.post('/newcanvas',{name:name}).then(()=>{
                this.$swal('Success','A new canvas was successfully !!!','success');
                this.$Progress.finish();
            }).catch((error)=>{
                this.$Progress.fail();
                this.$swal('Sorry !',error.message,'error');
            })
        },

        // open recent
        openRecent(id){
            console.log(id)
            this.$Progress.start();
            axios.post(`/openrecent/${id}`).then(()=>{
                // this.$swal('Success','A recent canvas was opened !!!','success');
                this.$Progress.finish();
            }).catch((error)=>{
                this.$Progress.fail();
                this.$swal('Sorry !',error.message,'error');
            })
        }
    
}