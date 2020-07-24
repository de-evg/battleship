const aimList = [];
for (let column = 0; column < 10; column++) {
    for (let row = 0; row < 10; row++) {
        const aim = column.toString() + row.toString();
        aimList.push(aim);        
    }    
}

export default aimList