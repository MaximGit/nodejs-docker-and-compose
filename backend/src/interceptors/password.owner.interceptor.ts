import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class OwnerPasswordInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (Array.isArray(data)) {
          return data.map((user) => {
            const {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              owner: { password, ...userWithNoPass },
              ...restData
            } = user;
            return { ...restData, owner: userWithNoPass };
          });
        } else {
          data?.offers?.map((offer) => {
            delete offer.user.password;
            return offer;
          });
          const {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            owner: { password, ...ownerWithoutPassword },
            ...rest
          } = data;
          return { ...rest, owner: ownerWithoutPassword };
        }
      }),
    );
  }
}
