interface CallbackData {
  currentDevice: string;
  width: number;
  height: number;
  oldDevice?: string;
  newDevice?: string;
}

class ResponsiveManager {
  breakpoints: { mobile: number; tablet: number; desktop: number; wide: number };
  currentDevice: string;
  callbacks: { [key: string]: ((data: CallbackData) => void)[] };

  constructor(options: { breakpoints?: { mobile?: number; tablet?: number; desktop?: number; wide?: number } } = {}) {
    this.breakpoints = {
      mobile: options.breakpoints?.mobile ?? 480,
      tablet: options.breakpoints?.tablet ?? 768,
      desktop: options.breakpoints?.desktop ?? 1024,
      wide: options.breakpoints?.wide ?? 1440
    };

    this.currentDevice = '';
    this.callbacks = {
      mobile: [],
      tablet: [],
      desktop: [],
      wide: [],
      resize: []
    };

    this.init();
  }

  init(): void {
    this.detectDevice();

    let resizeTimer: NodeJS.Timeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.detectDevice();
        this.executeCallbacks('resize');
      }, 250);
    });

    globalThis.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.detectDevice();
      }, 200);
    });
  }

  detectDevice(): void {
    const width = window.innerWidth;
    let newDevice = '';

    if (width < this.breakpoints.tablet) {
      newDevice = 'mobile';
    } else if (width < this.breakpoints.desktop) {
      newDevice = 'tablet';
    } else if (width < this.breakpoints.wide) {
      newDevice = 'desktop';
    } else {
      newDevice = 'wide';
    }

    if (newDevice !== this.currentDevice) {
      const oldDevice = this.currentDevice;
      this.currentDevice = newDevice;

      document.body.classList.remove('device-mobile', 'device-tablet', 'device-desktop', 'device-wide');
      document.body.classList.add(`device-${newDevice}`);

      this.executeCallbacks(newDevice, { oldDevice, newDevice, width });
    }
  }

  on(deviceType: string, callback: (data: CallbackData) => void): void {
    if (this.callbacks[deviceType]) {
      this.callbacks[deviceType].push(callback);
    }
  }

  executeCallbacks(type: string, data: Partial<CallbackData> = {}): void {
    if (this.callbacks[type]) {
      this.callbacks[type].forEach(callback => {
        callback({ ...data, currentDevice: this.currentDevice, width: window.innerWidth, height: window.innerHeight });
      });
    }
  }

  getDevice(): string {
    return this.currentDevice;
  }

  is(deviceType: string): boolean {
    return this.currentDevice === deviceType;
  }

  isMobile(): boolean {
     return ['mobile', 'tablet'].includes(this.currentDevice);
   }

   getViewport(): { width: number; height: number; orientation:string }{
     return{
       width : window.innerWidth,
       height : window.innerHeight,
       orientation : window.innerWidth > window.innerHeight ? "landscape" : "portrait"
     }
   }
  
   isLandscape(): boolean{
     return window.innerWidth > window.innerHeight;
   }
  
   isPortrait(): boolean{
     return window.innerHeight > window.innerWidth;
   }
  
   enforceLandscape(options:{ showWarning?:boolean; message?:string}={}) :void{
     const showWarning:boolean= options.showWarning !== false;
     const warningMessage:string= options.message || 'Please turn your device to landscape mode';

     if (!this.isMobile()) return;

     if(showWarning && !document.getElementById('landscape-warning')){
       const overlay=document.createElement('div');
       overlay.id='landscape-warning';
       overlay.style.cssText=`
         position:fixed;
         top :0 ;
         left :0 ;
         width :100% ;
         height :100%;
         background :rgba(0 ,0 ,0 ,0.95);
         display:none ;
         justify-content:center ;
         align-items:center ;
         z-index :99999 ;
         flex-direction :column ;
         color:white ;
         font-family:'Arial' ,sans-serif ;
         text-align:center ;
         padding :20px ;`;

       overlay.innerHTML=`
          <div style="font-size :64px ;margin-bottom :20px;">📱 ↻</div>
          <div style="font-size :24px;font-weight:bold;margin-bottom :10px;">${warningMessage}</div>
          <div style="font-size :16px;opacity:.8;">This app works best in landscape mode</div>`;

       document.body.appendChild(overlay);
     }

     const checkOrientation=()=>{
       const overlay=document.getElementById('landscape-warning');
       if(!overlay)return;

       if(this.isPortrait() &&this.isMobile()){
           overlay.style.display='flex';
           document.body.style.overflow='hidden';
        }else{
            overlay.style.display='none';
            document.body.style.overflow='';
        }
       
     };

     checkOrientation();
     this.on('resize',checkOrientation);
     
     globalThis.addEventListener('orientationchange',()=>{
       setTimeout(checkOrientation,100);
     });
     
   }

   disableLandscapeWarning():void{
     const overlay=document.getElementById('landscape-warning');
     
     if(overlay){
       overlay.remove();
       document.body.style.overflow='';
      
     }
   
   }


   getOptimalRatio():number{
    
const device=this.getDevice();

switch(device){
 case'mobile':
return 1.78;
case'tablet':
return 1.6;
case'desktop':
case'wide':
return 1.78;
default:
return 1.78;
}
}

getCurrentRatio():number{
const viewport=this.getViewport();
return viewport.width /viewport.height;

}

adaptContainerToRatio(container:string | HTMLElement, options:{ ratio?:number ;mode?:string ;center?:boolean}={}):{ width:number;height:number ;ratio:number}{
if(typeof container==='string'){
container=document.querySelector(container) as HTMLElement;}

if(!container){
console.error('Container not found');
return{width:-1,height:-1,ratio:-1};
}

const targetRatio=options.ratio||this.getOptimalRatio();
const mode=options.mode||'contain';
const viewport=this.getViewport();

let width:number=viewport.width,height:number=viewport.height;

switch(mode){
case'contain':
if(viewport.width /viewport.height>targetRatio){
height=viewport.height;
width=height*targetRatio;}else{
width=viewport.width;
height=width/targetRatio;}
break;

case'cover':
if(viewport.width /viewport.height>targetRatio){
width=viewport.width;height=width/targetRatio;}else{
height=viewport.height;width=height*targetRatio;}
break;

case'fill':
width=viewport.width;height=viewport.height;break;}

container.style.width=`${width}px`;
container.style.height=`${height}px`;
container.style.maxWidth='100%'; 
container.style.maxHeight='100%';

if(options.center!==false){ 
container.style.margin='0 auto'; 
container.style.position='relative'; 
container.style.left='50%'; 
container.style.top='50%'; 
container.style.transform='translate(-50%, -50%)';}

return{width,height,ratio:(width/height)};
}

enableAutoRatioAdapt(container:string | HTMLElement, options:object={}):()=>void{

const adapt=()=>{this.adaptContainerToRatio(container,options);};

adapt();

this.on('resize',adapt);

globalThis.addEventListener('orientationchange',()=>{
setTimeout(adapt,100);});

return adapt;}

adaptFontSize(baseSize:number=16):void{

const width:number=window.innerWidth;

let fontSize:number=baseSize;

if(width<this.breakpoints.mobile){
fontSize=baseSize *0.875;}else if(width<this.breakpoints.tablet){
fontSize=baseSize *0.9375;}else if(width>=this.breakpoints.wide){
fontSize+=baseSize *1.125;}

document.documentElement.style.fontSize=`${fontSize}px`;}


}

const responsive=new ResponsiveManager({
breakpoints:{
mobile: 480,
tablet: 768,
desktop: 1024,
wide: 1440
}});

responsive.adaptFontSize(16);

responsive.on('resize',()=>{
responsive.adaptFontSize(16);});

responsive.on('mobile',(data)=>{
console.log('Switch to mobile mode',data);});

responsive.on('tablet',(data)=>{
console.log('Switch to tablet mode',data);});

responsive.on('desktop',(data)=>{
console.log('Switch to desktop mode',data);});

responsive.on("resize",(data)=>{
 console.log("resizing:", data)
})

const ResponsiveUtils={
showOnDevice(element: HTMLElement, devices: string[] = []): void {

const current_device = responsive.getDevice();
if(devices.includes(current_device)){
element.style.display = '';
}else{
element.style.display='none'
}
},

loadResponsiveImage(img: HTMLImageElement, sources: { [key: string]: string }): void {

const device = responsive.getDevice();

if(sources[device]){
img.src=sources[device]
}
},

adaptGrid(container: HTMLElement, columns: { [key: string]: number }): void {

const device = responsive.getDevice();
const cols = (columns[device] || columns.desktop || 3);

container.style.gridTemplateColumns = `repeat(${cols},1fr)`;
}
};

if(typeof module!=='undefined'&&module.exports){

module.exports={ResponsiveManager, ResponsiveUtils};
}

; (globalThis as typeof globalThis & { ResponsiveManager: typeof ResponsiveManager }).ResponsiveManager = ResponsiveManager;
; (globalThis as typeof globalThis & { ResponsiveUtils: typeof ResponsiveUtils }).ResponsiveUtils = ResponsiveUtils;
; (globalThis as typeof globalThis & { responsive: typeof responsive }).responsive = responsive;
