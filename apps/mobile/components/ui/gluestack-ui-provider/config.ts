'use client';
import { vars } from 'nativewind';

/**
 * PetWatch tokens (Claude Design, docs/design/…/TokenSheet.dc.html). Values are "R G B".
 * Light: steps 50/100/500/600/700/900 are the design's; the rest are OKLCH interpolations
 * (0 = ½ white→50, 200–400 = ¼·½·¾ of 100→500, 800 = ½ 700→900, 950 = 900 40% toward black).
 * Dark: each scale mirrors light (0↔950, 50↔900, …) so one class works in both modes, then the
 * design's dark anchors override. See DECISIONS D36.
 */
export const config = {
  light: vars({
    /* Primary */
    '--color-primary-0': '253 248 245', // #FDF8F5
    '--color-primary-50': '251 241 236', // #FBF1EC
    '--color-primary-100': '246 224 213', // #F6E0D5
    '--color-primary-200': '236 194 173', // #ECC2AD
    '--color-primary-300': '225 163 135', // #E1A387
    '--color-primary-400': '213 132 98', // #D58462
    '--color-primary-500': '200 100 59', // #C8643B
    '--color-primary-600': '174 82 48', // #AE5230
    '--color-primary-700': '143 66 39', // #8F4227
    '--color-primary-800': '116 54 33', // #743621
    '--color-primary-900': '90 42 26', // #5A2A1A
    '--color-primary-950': '41 16 7', // #291007
    
    /* Secondary */
    '--color-secondary-0': '251 250 248', // #FBFAF8
    '--color-secondary-50': '247 245 242', // #F7F5F2
    '--color-secondary-100': '239 235 229', // #EFEBE5
    '--color-secondary-200': '217 211 203', // #D9D3CB
    '--color-secondary-300': '195 188 178', // #C3BCB2
    '--color-secondary-400': '174 165 154', // #AEA59A
    '--color-secondary-500': '154 143 130', // #9A8F82
    '--color-secondary-600': '125 115 103', // #7D7367
    '--color-secondary-700': '98 89 79', // #62594F
    '--color-secondary-800': '74 68 61', // #4A443D
    '--color-secondary-900': '52 48 43', // #34302B
    '--color-secondary-950': '21 19 16', // #151310
    
    /* Tertiary */
    '--color-tertiary-0': '251 248 251', // #FBF8FB
    '--color-tertiary-50': '247 241 247', // #F7F1F7
    '--color-tertiary-100': '238 223 238', // #EEDFEE
    '--color-tertiary-200': '217 189 217', // #D9BDD9
    '--color-tertiary-300': '196 156 195', // #C49CC3
    '--color-tertiary-400': '175 123 174', // #AF7BAE
    '--color-tertiary-500': '154 91 152', // #9A5B98
    '--color-tertiary-600': '128 71 127', // #80477F
    '--color-tertiary-700': '102 56 102', // #663866
    '--color-tertiary-800': '81 45 81', // #512D51
    '--color-tertiary-900': '61 34 61', // #3D223D
    '--color-tertiary-950': '26 11 26', // #1A0B1A
    
    /* Error */
    '--color-error-0': '254 247 246', // #FEF7F6
    '--color-error-50': '253 240 238', // #FDF0EE
    '--color-error-100': '250 220 215', // #FADCD7
    '--color-error-200': '245 185 175', // #F5B9AF
    '--color-error-300': '237 149 136', // #ED9588
    '--color-error-400': '227 111 98', // #E36F62
    '--color-error-500': '214 69 58', // #D6453A
    '--color-error-600': '184 52 43', // #B8342B
    '--color-error-700': '150 42 35', // #962A23
    '--color-error-800': '120 34 29', // #78221D
    '--color-error-900': '92 26 22', // #5C1A16
    '--color-error-950': '42 7 6', // #2A0706
    
    /* Success */
    '--color-success-0': '247 250 247', // #F7FAF7
    '--color-success-50': '239 246 240', // #EFF6F0
    '--color-success-100': '217 235 220', // #D9EBDC
    '--color-success-200': '183 215 188', // #B7D7BC
    '--color-success-300': '148 194 156', // #94C29C
    '--color-success-400': '114 174 125', // #72AE7D
    '--color-success-500': '78 154 94', // #4E9A5E
    '--color-success-600': '60 127 75', // #3C7F4B
    '--color-success-700': '47 101 60', // #2F653C
    '--color-success-800': '37 81 48', // #255130
    '--color-success-900': '28 61 36', // #1C3D24
    '--color-success-950': '8 26 12', // #081A0C
    
    /* Warning */
    '--color-warning-0': '254 251 244', // #FEFBF4
    '--color-warning-50': '253 246 233', // #FDF6E9
    '--color-warning-100': '250 234 203', // #FAEACB
    '--color-warning-200': '241 215 167', // #F1D7A7
    '--color-warning-300': '233 195 131', // #E9C383
    '--color-warning-400': '225 175 92', // #E1AF5C
    '--color-warning-500': '217 154 43', // #D99A2B
    '--color-warning-600': '183 125 27', // #B77D1B
    '--color-warning-700': '143 96 20', // #8F6014
    '--color-warning-800': '114 76 15', // #724C0F
    '--color-warning-900': '86 57 11', // #56390B
    '--color-warning-950': '39 23 2', // #271702
    
    /* Info */
    '--color-info-0': '246 249 253', // #F6F9FD
    '--color-info-50': '238 243 250', // #EEF3FA
    '--color-info-100': '216 228 244', // #D8E4F4
    '--color-info-200': '179 201 230', // #B3C9E6
    '--color-info-300': '143 174 215', // #8FAED7
    '--color-info-400': '108 147 200', // #6C93C8
    '--color-info-500': '74 120 184', // #4A78B8
    '--color-info-600': '58 98 156', // #3A629C
    '--color-info-700': '46 78 125', // #2E4E7D
    '--color-info-800': '36 62 100', // #243E64
    '--color-info-900': '27 47 76', // #1B2F4C
    '--color-info-950': '8 18 34', // #081222
    
    /* Typography */
    '--color-typography-0': '255 255 255', // #FFFFFF
    '--color-typography-50': '247 245 242', // #F7F5F2
    '--color-typography-100': '239 235 229', // #EFEBE5
    '--color-typography-200': '208 203 195', // #D0CBC3
    '--color-typography-300': '179 172 163', // #B3ACA3
    '--color-typography-400': '150 141 131', // #968D83
    '--color-typography-500': '122 112 101', // #7A7065
    '--color-typography-600': '106 97 88', // #6A6158
    '--color-typography-700': '74 67 59', // #4A433B
    '--color-typography-800': '58 52 45', // #3A342D
    '--color-typography-900': '42 37 32', // #2A2520
    '--color-typography-950': '16 13 10', // #100D0A
    
    /* Outline */
    '--color-outline-0': '249 247 244', // #F9F7F4
    '--color-outline-50': '244 240 234', // #F4F0EA
    '--color-outline-100': '233 227 218', // #E9E3DA
    '--color-outline-200': '220 212 200', // #DCD4C8
    '--color-outline-300': '202 193 181', // #CAC1B5
    '--color-outline-400': '185 175 162', // #B9AFA2
    '--color-outline-500': '168 157 143', // #A89D8F
    '--color-outline-600': '140 129 116', // #8C8174
    '--color-outline-700': '110 101 90', // #6E655A
    '--color-outline-800': '83 76 67', // #534C43
    '--color-outline-900': '58 52 46', // #3A342E
    '--color-outline-950': '24 21 18', // #181512
    
    /* Background */
    '--color-background-0': '255 255 255', // #FFFFFF
    '--color-background-50': '250 247 242', // #FAF7F2
    '--color-background-100': '243 238 230', // #F3EEE6
    '--color-background-200': '234 228 218', // #EAE4DA
    '--color-background-300': '225 218 207', // #E1DACF
    '--color-background-400': '216 208 195', // #D8D0C3
    '--color-background-500': '207 198 184', // #CFC6B8
    '--color-background-600': '154 143 130', // #9A8F82
    '--color-background-700': '74 67 59', // #4A433B
    '--color-background-800': '51 46 41', // #332E29
    '--color-background-900': '30 27 24', // #1E1B18
    '--color-background-950': '9 8 7', // #090807
    
    /* Background special + focus ring (derived from the scales above) */
    '--color-background-error': '253 240 238', // #FDF0EE
    '--color-background-warning': '253 246 233', // #FDF6E9
    '--color-background-success': '239 246 240', // #EFF6F0
    '--color-background-muted': '247 245 242', // #F7F5F2
    '--color-background-info': '238 243 250', // #EEF3FA
    '--color-indicator-primary': '174 82 48', // #AE5230
    '--color-indicator-info': '74 120 184', // #4A78B8
    '--color-indicator-error': '184 52 43', // #B8342B
  }),
  dark: vars({
    /* Primary */
    '--color-primary-0': '41 16 7', // #291007
    '--color-primary-50': '90 42 26', // #5A2A1A
    '--color-primary-100': '116 54 33', // #743621
    '--color-primary-200': '143 66 39', // #8F4227
    '--color-primary-300': '174 82 48', // #AE5230
    '--color-primary-400': '200 100 59', // #C8643B
    '--color-primary-500': '213 132 98', // #D58462
    '--color-primary-600': '224 138 99', // #E08A63
    '--color-primary-700': '236 194 173', // #ECC2AD
    '--color-primary-800': '246 224 213', // #F6E0D5
    '--color-primary-900': '251 241 236', // #FBF1EC
    '--color-primary-950': '253 248 245', // #FDF8F5
    
    /* Secondary */
    '--color-secondary-0': '21 19 16', // #151310
    '--color-secondary-50': '52 48 43', // #34302B
    '--color-secondary-100': '74 68 61', // #4A443D
    '--color-secondary-200': '98 89 79', // #62594F
    '--color-secondary-300': '125 115 103', // #7D7367
    '--color-secondary-400': '154 143 130', // #9A8F82
    '--color-secondary-500': '174 165 154', // #AEA59A
    '--color-secondary-600': '195 188 178', // #C3BCB2
    '--color-secondary-700': '217 211 203', // #D9D3CB
    '--color-secondary-800': '239 235 229', // #EFEBE5
    '--color-secondary-900': '247 245 242', // #F7F5F2
    '--color-secondary-950': '251 250 248', // #FBFAF8
    
    /* Tertiary */
    '--color-tertiary-0': '26 11 26', // #1A0B1A
    '--color-tertiary-50': '61 34 61', // #3D223D
    '--color-tertiary-100': '81 45 81', // #512D51
    '--color-tertiary-200': '102 56 102', // #663866
    '--color-tertiary-300': '128 71 127', // #80477F
    '--color-tertiary-400': '154 91 152', // #9A5B98
    '--color-tertiary-500': '175 123 174', // #AF7BAE
    '--color-tertiary-600': '196 156 195', // #C49CC3
    '--color-tertiary-700': '217 189 217', // #D9BDD9
    '--color-tertiary-800': '238 223 238', // #EEDFEE
    '--color-tertiary-900': '247 241 247', // #F7F1F7
    '--color-tertiary-950': '251 248 251', // #FBF8FB
    
    /* Error */
    '--color-error-0': '42 7 6', // #2A0706
    '--color-error-50': '92 26 22', // #5C1A16
    '--color-error-100': '120 34 29', // #78221D
    '--color-error-200': '150 42 35', // #962A23
    '--color-error-300': '184 52 43', // #B8342B
    '--color-error-400': '214 69 58', // #D6453A
    '--color-error-500': '227 111 98', // #E36F62
    '--color-error-600': '237 149 136', // #ED9588
    '--color-error-700': '245 185 175', // #F5B9AF
    '--color-error-800': '250 220 215', // #FADCD7
    '--color-error-900': '253 240 238', // #FDF0EE
    '--color-error-950': '254 247 246', // #FEF7F6
    
    /* Success */
    '--color-success-0': '8 26 12', // #081A0C
    '--color-success-50': '28 61 36', // #1C3D24
    '--color-success-100': '37 81 48', // #255130
    '--color-success-200': '47 101 60', // #2F653C
    '--color-success-300': '60 127 75', // #3C7F4B
    '--color-success-400': '78 154 94', // #4E9A5E
    '--color-success-500': '114 174 125', // #72AE7D
    '--color-success-600': '148 194 156', // #94C29C
    '--color-success-700': '183 215 188', // #B7D7BC
    '--color-success-800': '217 235 220', // #D9EBDC
    '--color-success-900': '239 246 240', // #EFF6F0
    '--color-success-950': '247 250 247', // #F7FAF7
    
    /* Warning */
    '--color-warning-0': '39 23 2', // #271702
    '--color-warning-50': '86 57 11', // #56390B
    '--color-warning-100': '114 76 15', // #724C0F
    '--color-warning-200': '143 96 20', // #8F6014
    '--color-warning-300': '183 125 27', // #B77D1B
    '--color-warning-400': '217 154 43', // #D99A2B
    '--color-warning-500': '225 175 92', // #E1AF5C
    '--color-warning-600': '233 195 131', // #E9C383
    '--color-warning-700': '241 215 167', // #F1D7A7
    '--color-warning-800': '250 234 203', // #FAEACB
    '--color-warning-900': '253 246 233', // #FDF6E9
    '--color-warning-950': '254 251 244', // #FEFBF4
    
    /* Info */
    '--color-info-0': '8 18 34', // #081222
    '--color-info-50': '27 47 76', // #1B2F4C
    '--color-info-100': '36 62 100', // #243E64
    '--color-info-200': '46 78 125', // #2E4E7D
    '--color-info-300': '58 98 156', // #3A629C
    '--color-info-400': '74 120 184', // #4A78B8
    '--color-info-500': '108 147 200', // #6C93C8
    '--color-info-600': '143 174 215', // #8FAED7
    '--color-info-700': '179 201 230', // #B3C9E6
    '--color-info-800': '216 228 244', // #D8E4F4
    '--color-info-900': '238 243 250', // #EEF3FA
    '--color-info-950': '246 249 253', // #F6F9FD
    
    /* Typography */
    '--color-typography-0': '30 27 24', // #1E1B18
    '--color-typography-50': '42 37 32', // #2A2520
    '--color-typography-100': '58 52 45', // #3A342D
    '--color-typography-200': '74 67 59', // #4A433B
    '--color-typography-300': '106 97 88', // #6A6158
    '--color-typography-400': '122 112 101', // #7A7065
    '--color-typography-500': '150 141 131', // #968D83
    '--color-typography-600': '207 198 184', // #CFC6B8
    '--color-typography-700': '208 203 195', // #D0CBC3
    '--color-typography-800': '239 235 229', // #EFEBE5
    '--color-typography-900': '243 238 230', // #F3EEE6
    '--color-typography-950': '255 255 255', // #FFFFFF
    
    /* Outline */
    '--color-outline-0': '24 21 18', // #181512
    '--color-outline-50': '58 52 46', // #3A342E
    '--color-outline-100': '83 76 67', // #534C43
    '--color-outline-200': '74 67 59', // #4A433B
    '--color-outline-300': '140 129 116', // #8C8174
    '--color-outline-400': '168 157 143', // #A89D8F
    '--color-outline-500': '185 175 162', // #B9AFA2
    '--color-outline-600': '202 193 181', // #CAC1B5
    '--color-outline-700': '220 212 200', // #DCD4C8
    '--color-outline-800': '233 227 218', // #E9E3DA
    '--color-outline-900': '244 240 234', // #F4F0EA
    '--color-outline-950': '249 247 244', // #F9F7F4
    
    /* Background */
    '--color-background-0': '42 37 32', // #2A2520
    '--color-background-50': '30 27 24', // #1E1B18
    '--color-background-100': '51 46 41', // #332E29
    '--color-background-200': '74 67 59', // #4A433B
    '--color-background-300': '154 143 130', // #9A8F82
    '--color-background-400': '207 198 184', // #CFC6B8
    '--color-background-500': '216 208 195', // #D8D0C3
    '--color-background-600': '225 218 207', // #E1DACF
    '--color-background-700': '234 228 218', // #EAE4DA
    '--color-background-800': '243 238 230', // #F3EEE6
    '--color-background-900': '250 247 242', // #FAF7F2
    '--color-background-950': '255 255 255', // #FFFFFF
    
    /* Background special + focus ring (derived from the scales above) */
    '--color-background-error': '120 34 29', // #78221D
    '--color-background-warning': '114 76 15', // #724C0F
    '--color-background-success': '37 81 48', // #255130
    '--color-background-muted': '74 68 61', // #4A443D
    '--color-background-info': '36 62 100', // #243E64
    '--color-indicator-primary': '224 138 99', // #E08A63
    '--color-indicator-info': '108 147 200', // #6C93C8
    '--color-indicator-error': '237 149 136', // #ED9588
  }),
};
