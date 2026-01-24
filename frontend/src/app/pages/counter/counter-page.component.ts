///IMPORT QUE NOS PERMITE 
import { Component } from '@angular/core'



///CLASE DE ANGULAR
@Component({
    templateUrl: './counter-page.component.html',
    styleUrl: `./counter-page.component.scss`

})

export class CounterPageComponent{
    counter = 69;

    increaseBy(value: number){
        this.counter += value;
    }

    decreaseBy(value: number){
        this.counter -= value;
    }

    resetBy(){
        this.counter = 0;
    }
}