const fs = require('fs');
let c = fs.readFileSync('src/pages/employee/index.tsx', 'utf8');
const badEnding = \`      </div>
    </div>
  );

      </div>
    </div>
  );
};\`;
const goodEnding = \`      </div>
    </div>
  );
};\`;
c = c.replace(badEnding, goodEnding);
fs.writeFileSync('src/pages/employee/index.tsx', c);
console.log('Fixed end of file');
