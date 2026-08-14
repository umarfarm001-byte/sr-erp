const fs = require('fs');
let lines = fs.readFileSync('src/app/(dashboard)/orders/[id]/JobCardClient.tsx', 'utf-8').split('\n');
lines.splice(856, 0, '                              ))}');
lines.splice(857, 0, '                            </tbody>');
lines.splice(858, 0, '                          </table>');
fs.writeFileSync('src/app/(dashboard)/orders/[id]/JobCardClient.tsx', lines.join('\n'));
