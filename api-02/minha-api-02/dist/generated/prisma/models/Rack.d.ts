import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type RackModel = runtime.Types.Result.DefaultSelection<Prisma.$RackPayload>;
export type AggregateRack = {
    _count: RackCountAggregateOutputType | null;
    _avg: RackAvgAggregateOutputType | null;
    _sum: RackSumAggregateOutputType | null;
    _min: RackMinAggregateOutputType | null;
    _max: RackMaxAggregateOutputType | null;
};
export type RackAvgAggregateOutputType = {
    capacidade: number | null;
};
export type RackSumAggregateOutputType = {
    capacidade: number | null;
};
export type RackMinAggregateOutputType = {
    id: string | null;
    nome: string | null;
    localizacao: string | null;
    corredor: string | null;
    capacidade: number | null;
    observacoes: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    deletedAt: Date | null;
};
export type RackMaxAggregateOutputType = {
    id: string | null;
    nome: string | null;
    localizacao: string | null;
    corredor: string | null;
    capacidade: number | null;
    observacoes: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    deletedAt: Date | null;
};
export type RackCountAggregateOutputType = {
    id: number;
    nome: number;
    localizacao: number;
    corredor: number;
    capacidade: number;
    observacoes: number;
    createdAt: number;
    updatedAt: number;
    deletedAt: number;
    _all: number;
};
export type RackAvgAggregateInputType = {
    capacidade?: true;
};
export type RackSumAggregateInputType = {
    capacidade?: true;
};
export type RackMinAggregateInputType = {
    id?: true;
    nome?: true;
    localizacao?: true;
    corredor?: true;
    capacidade?: true;
    observacoes?: true;
    createdAt?: true;
    updatedAt?: true;
    deletedAt?: true;
};
export type RackMaxAggregateInputType = {
    id?: true;
    nome?: true;
    localizacao?: true;
    corredor?: true;
    capacidade?: true;
    observacoes?: true;
    createdAt?: true;
    updatedAt?: true;
    deletedAt?: true;
};
export type RackCountAggregateInputType = {
    id?: true;
    nome?: true;
    localizacao?: true;
    corredor?: true;
    capacidade?: true;
    observacoes?: true;
    createdAt?: true;
    updatedAt?: true;
    deletedAt?: true;
    _all?: true;
};
export type RackAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RackWhereInput;
    orderBy?: Prisma.RackOrderByWithRelationInput | Prisma.RackOrderByWithRelationInput[];
    cursor?: Prisma.RackWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | RackCountAggregateInputType;
    _avg?: RackAvgAggregateInputType;
    _sum?: RackSumAggregateInputType;
    _min?: RackMinAggregateInputType;
    _max?: RackMaxAggregateInputType;
};
export type GetRackAggregateType<T extends RackAggregateArgs> = {
    [P in keyof T & keyof AggregateRack]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateRack[P]> : Prisma.GetScalarType<T[P], AggregateRack[P]>;
};
export type RackGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RackWhereInput;
    orderBy?: Prisma.RackOrderByWithAggregationInput | Prisma.RackOrderByWithAggregationInput[];
    by: Prisma.RackScalarFieldEnum[] | Prisma.RackScalarFieldEnum;
    having?: Prisma.RackScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: RackCountAggregateInputType | true;
    _avg?: RackAvgAggregateInputType;
    _sum?: RackSumAggregateInputType;
    _min?: RackMinAggregateInputType;
    _max?: RackMaxAggregateInputType;
};
export type RackGroupByOutputType = {
    id: string;
    nome: string;
    localizacao: string | null;
    corredor: string | null;
    capacidade: number;
    observacoes: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    _count: RackCountAggregateOutputType | null;
    _avg: RackAvgAggregateOutputType | null;
    _sum: RackSumAggregateOutputType | null;
    _min: RackMinAggregateOutputType | null;
    _max: RackMaxAggregateOutputType | null;
};
export type GetRackGroupByPayload<T extends RackGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<RackGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof RackGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], RackGroupByOutputType[P]> : Prisma.GetScalarType<T[P], RackGroupByOutputType[P]>;
}>>;
export type RackWhereInput = {
    AND?: Prisma.RackWhereInput | Prisma.RackWhereInput[];
    OR?: Prisma.RackWhereInput[];
    NOT?: Prisma.RackWhereInput | Prisma.RackWhereInput[];
    id?: Prisma.StringFilter<"Rack"> | string;
    nome?: Prisma.StringFilter<"Rack"> | string;
    localizacao?: Prisma.StringNullableFilter<"Rack"> | string | null;
    corredor?: Prisma.StringNullableFilter<"Rack"> | string | null;
    capacidade?: Prisma.IntFilter<"Rack"> | number;
    observacoes?: Prisma.StringNullableFilter<"Rack"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"Rack"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Rack"> | Date | string;
    deletedAt?: Prisma.DateTimeNullableFilter<"Rack"> | Date | string | null;
    ativos?: Prisma.AtivoListRelationFilter;
};
export type RackOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    localizacao?: Prisma.SortOrderInput | Prisma.SortOrder;
    corredor?: Prisma.SortOrderInput | Prisma.SortOrder;
    capacidade?: Prisma.SortOrder;
    observacoes?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    deletedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    ativos?: Prisma.AtivoOrderByRelationAggregateInput;
};
export type RackWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    nome?: string;
    AND?: Prisma.RackWhereInput | Prisma.RackWhereInput[];
    OR?: Prisma.RackWhereInput[];
    NOT?: Prisma.RackWhereInput | Prisma.RackWhereInput[];
    localizacao?: Prisma.StringNullableFilter<"Rack"> | string | null;
    corredor?: Prisma.StringNullableFilter<"Rack"> | string | null;
    capacidade?: Prisma.IntFilter<"Rack"> | number;
    observacoes?: Prisma.StringNullableFilter<"Rack"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"Rack"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Rack"> | Date | string;
    deletedAt?: Prisma.DateTimeNullableFilter<"Rack"> | Date | string | null;
    ativos?: Prisma.AtivoListRelationFilter;
}, "id" | "nome">;
export type RackOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    localizacao?: Prisma.SortOrderInput | Prisma.SortOrder;
    corredor?: Prisma.SortOrderInput | Prisma.SortOrder;
    capacidade?: Prisma.SortOrder;
    observacoes?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    deletedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    _count?: Prisma.RackCountOrderByAggregateInput;
    _avg?: Prisma.RackAvgOrderByAggregateInput;
    _max?: Prisma.RackMaxOrderByAggregateInput;
    _min?: Prisma.RackMinOrderByAggregateInput;
    _sum?: Prisma.RackSumOrderByAggregateInput;
};
export type RackScalarWhereWithAggregatesInput = {
    AND?: Prisma.RackScalarWhereWithAggregatesInput | Prisma.RackScalarWhereWithAggregatesInput[];
    OR?: Prisma.RackScalarWhereWithAggregatesInput[];
    NOT?: Prisma.RackScalarWhereWithAggregatesInput | Prisma.RackScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"Rack"> | string;
    nome?: Prisma.StringWithAggregatesFilter<"Rack"> | string;
    localizacao?: Prisma.StringNullableWithAggregatesFilter<"Rack"> | string | null;
    corredor?: Prisma.StringNullableWithAggregatesFilter<"Rack"> | string | null;
    capacidade?: Prisma.IntWithAggregatesFilter<"Rack"> | number;
    observacoes?: Prisma.StringNullableWithAggregatesFilter<"Rack"> | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Rack"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"Rack"> | Date | string;
    deletedAt?: Prisma.DateTimeNullableWithAggregatesFilter<"Rack"> | Date | string | null;
};
export type RackCreateInput = {
    id?: string;
    nome: string;
    localizacao?: string | null;
    corredor?: string | null;
    capacidade?: number;
    observacoes?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    deletedAt?: Date | string | null;
    ativos?: Prisma.AtivoCreateNestedManyWithoutRackInput;
};
export type RackUncheckedCreateInput = {
    id?: string;
    nome: string;
    localizacao?: string | null;
    corredor?: string | null;
    capacidade?: number;
    observacoes?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    deletedAt?: Date | string | null;
    ativos?: Prisma.AtivoUncheckedCreateNestedManyWithoutRackInput;
};
export type RackUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    localizacao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    corredor?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    capacidade?: Prisma.IntFieldUpdateOperationsInput | number;
    observacoes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    ativos?: Prisma.AtivoUpdateManyWithoutRackNestedInput;
};
export type RackUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    localizacao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    corredor?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    capacidade?: Prisma.IntFieldUpdateOperationsInput | number;
    observacoes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    ativos?: Prisma.AtivoUncheckedUpdateManyWithoutRackNestedInput;
};
export type RackCreateManyInput = {
    id?: string;
    nome: string;
    localizacao?: string | null;
    corredor?: string | null;
    capacidade?: number;
    observacoes?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    deletedAt?: Date | string | null;
};
export type RackUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    localizacao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    corredor?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    capacidade?: Prisma.IntFieldUpdateOperationsInput | number;
    observacoes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type RackUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    localizacao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    corredor?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    capacidade?: Prisma.IntFieldUpdateOperationsInput | number;
    observacoes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type RackCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    localizacao?: Prisma.SortOrder;
    corredor?: Prisma.SortOrder;
    capacidade?: Prisma.SortOrder;
    observacoes?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    deletedAt?: Prisma.SortOrder;
};
export type RackAvgOrderByAggregateInput = {
    capacidade?: Prisma.SortOrder;
};
export type RackMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    localizacao?: Prisma.SortOrder;
    corredor?: Prisma.SortOrder;
    capacidade?: Prisma.SortOrder;
    observacoes?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    deletedAt?: Prisma.SortOrder;
};
export type RackMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    nome?: Prisma.SortOrder;
    localizacao?: Prisma.SortOrder;
    corredor?: Prisma.SortOrder;
    capacidade?: Prisma.SortOrder;
    observacoes?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    deletedAt?: Prisma.SortOrder;
};
export type RackSumOrderByAggregateInput = {
    capacidade?: Prisma.SortOrder;
};
export type RackNullableScalarRelationFilter = {
    is?: Prisma.RackWhereInput | null;
    isNot?: Prisma.RackWhereInput | null;
};
export type IntFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type RackCreateNestedOneWithoutAtivosInput = {
    create?: Prisma.XOR<Prisma.RackCreateWithoutAtivosInput, Prisma.RackUncheckedCreateWithoutAtivosInput>;
    connectOrCreate?: Prisma.RackCreateOrConnectWithoutAtivosInput;
    connect?: Prisma.RackWhereUniqueInput;
};
export type RackUpdateOneWithoutAtivosNestedInput = {
    create?: Prisma.XOR<Prisma.RackCreateWithoutAtivosInput, Prisma.RackUncheckedCreateWithoutAtivosInput>;
    connectOrCreate?: Prisma.RackCreateOrConnectWithoutAtivosInput;
    upsert?: Prisma.RackUpsertWithoutAtivosInput;
    disconnect?: Prisma.RackWhereInput | boolean;
    delete?: Prisma.RackWhereInput | boolean;
    connect?: Prisma.RackWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.RackUpdateToOneWithWhereWithoutAtivosInput, Prisma.RackUpdateWithoutAtivosInput>, Prisma.RackUncheckedUpdateWithoutAtivosInput>;
};
export type RackCreateWithoutAtivosInput = {
    id?: string;
    nome: string;
    localizacao?: string | null;
    corredor?: string | null;
    capacidade?: number;
    observacoes?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    deletedAt?: Date | string | null;
};
export type RackUncheckedCreateWithoutAtivosInput = {
    id?: string;
    nome: string;
    localizacao?: string | null;
    corredor?: string | null;
    capacidade?: number;
    observacoes?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    deletedAt?: Date | string | null;
};
export type RackCreateOrConnectWithoutAtivosInput = {
    where: Prisma.RackWhereUniqueInput;
    create: Prisma.XOR<Prisma.RackCreateWithoutAtivosInput, Prisma.RackUncheckedCreateWithoutAtivosInput>;
};
export type RackUpsertWithoutAtivosInput = {
    update: Prisma.XOR<Prisma.RackUpdateWithoutAtivosInput, Prisma.RackUncheckedUpdateWithoutAtivosInput>;
    create: Prisma.XOR<Prisma.RackCreateWithoutAtivosInput, Prisma.RackUncheckedCreateWithoutAtivosInput>;
    where?: Prisma.RackWhereInput;
};
export type RackUpdateToOneWithWhereWithoutAtivosInput = {
    where?: Prisma.RackWhereInput;
    data: Prisma.XOR<Prisma.RackUpdateWithoutAtivosInput, Prisma.RackUncheckedUpdateWithoutAtivosInput>;
};
export type RackUpdateWithoutAtivosInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    localizacao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    corredor?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    capacidade?: Prisma.IntFieldUpdateOperationsInput | number;
    observacoes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type RackUncheckedUpdateWithoutAtivosInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    nome?: Prisma.StringFieldUpdateOperationsInput | string;
    localizacao?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    corredor?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    capacidade?: Prisma.IntFieldUpdateOperationsInput | number;
    observacoes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type RackCountOutputType = {
    ativos: number;
};
export type RackCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    ativos?: boolean | RackCountOutputTypeCountAtivosArgs;
};
export type RackCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RackCountOutputTypeSelect<ExtArgs> | null;
};
export type RackCountOutputTypeCountAtivosArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AtivoWhereInput;
};
export type RackSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    nome?: boolean;
    localizacao?: boolean;
    corredor?: boolean;
    capacidade?: boolean;
    observacoes?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    deletedAt?: boolean;
    ativos?: boolean | Prisma.Rack$ativosArgs<ExtArgs>;
    _count?: boolean | Prisma.RackCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["rack"]>;
export type RackSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    nome?: boolean;
    localizacao?: boolean;
    corredor?: boolean;
    capacidade?: boolean;
    observacoes?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    deletedAt?: boolean;
}, ExtArgs["result"]["rack"]>;
export type RackSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    nome?: boolean;
    localizacao?: boolean;
    corredor?: boolean;
    capacidade?: boolean;
    observacoes?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    deletedAt?: boolean;
}, ExtArgs["result"]["rack"]>;
export type RackSelectScalar = {
    id?: boolean;
    nome?: boolean;
    localizacao?: boolean;
    corredor?: boolean;
    capacidade?: boolean;
    observacoes?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    deletedAt?: boolean;
};
export type RackOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "nome" | "localizacao" | "corredor" | "capacidade" | "observacoes" | "createdAt" | "updatedAt" | "deletedAt", ExtArgs["result"]["rack"]>;
export type RackInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    ativos?: boolean | Prisma.Rack$ativosArgs<ExtArgs>;
    _count?: boolean | Prisma.RackCountOutputTypeDefaultArgs<ExtArgs>;
};
export type RackIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type RackIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $RackPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Rack";
    objects: {
        ativos: Prisma.$AtivoPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        nome: string;
        localizacao: string | null;
        corredor: string | null;
        capacidade: number;
        observacoes: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }, ExtArgs["result"]["rack"]>;
    composites: {};
};
export type RackGetPayload<S extends boolean | null | undefined | RackDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$RackPayload, S>;
export type RackCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<RackFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: RackCountAggregateInputType | true;
};
export interface RackDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Rack'];
        meta: {
            name: 'Rack';
        };
    };
    findUnique<T extends RackFindUniqueArgs>(args: Prisma.SelectSubset<T, RackFindUniqueArgs<ExtArgs>>): Prisma.Prisma__RackClient<runtime.Types.Result.GetResult<Prisma.$RackPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends RackFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, RackFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__RackClient<runtime.Types.Result.GetResult<Prisma.$RackPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends RackFindFirstArgs>(args?: Prisma.SelectSubset<T, RackFindFirstArgs<ExtArgs>>): Prisma.Prisma__RackClient<runtime.Types.Result.GetResult<Prisma.$RackPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends RackFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, RackFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__RackClient<runtime.Types.Result.GetResult<Prisma.$RackPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends RackFindManyArgs>(args?: Prisma.SelectSubset<T, RackFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RackPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends RackCreateArgs>(args: Prisma.SelectSubset<T, RackCreateArgs<ExtArgs>>): Prisma.Prisma__RackClient<runtime.Types.Result.GetResult<Prisma.$RackPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends RackCreateManyArgs>(args?: Prisma.SelectSubset<T, RackCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends RackCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, RackCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RackPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends RackDeleteArgs>(args: Prisma.SelectSubset<T, RackDeleteArgs<ExtArgs>>): Prisma.Prisma__RackClient<runtime.Types.Result.GetResult<Prisma.$RackPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends RackUpdateArgs>(args: Prisma.SelectSubset<T, RackUpdateArgs<ExtArgs>>): Prisma.Prisma__RackClient<runtime.Types.Result.GetResult<Prisma.$RackPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends RackDeleteManyArgs>(args?: Prisma.SelectSubset<T, RackDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends RackUpdateManyArgs>(args: Prisma.SelectSubset<T, RackUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends RackUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, RackUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RackPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends RackUpsertArgs>(args: Prisma.SelectSubset<T, RackUpsertArgs<ExtArgs>>): Prisma.Prisma__RackClient<runtime.Types.Result.GetResult<Prisma.$RackPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends RackCountArgs>(args?: Prisma.Subset<T, RackCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], RackCountAggregateOutputType> : number>;
    aggregate<T extends RackAggregateArgs>(args: Prisma.Subset<T, RackAggregateArgs>): Prisma.PrismaPromise<GetRackAggregateType<T>>;
    groupBy<T extends RackGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: RackGroupByArgs['orderBy'];
    } : {
        orderBy?: RackGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, RackGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRackGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: RackFieldRefs;
}
export interface Prisma__RackClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    ativos<T extends Prisma.Rack$ativosArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Rack$ativosArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AtivoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface RackFieldRefs {
    readonly id: Prisma.FieldRef<"Rack", 'String'>;
    readonly nome: Prisma.FieldRef<"Rack", 'String'>;
    readonly localizacao: Prisma.FieldRef<"Rack", 'String'>;
    readonly corredor: Prisma.FieldRef<"Rack", 'String'>;
    readonly capacidade: Prisma.FieldRef<"Rack", 'Int'>;
    readonly observacoes: Prisma.FieldRef<"Rack", 'String'>;
    readonly createdAt: Prisma.FieldRef<"Rack", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"Rack", 'DateTime'>;
    readonly deletedAt: Prisma.FieldRef<"Rack", 'DateTime'>;
}
export type RackFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RackSelect<ExtArgs> | null;
    omit?: Prisma.RackOmit<ExtArgs> | null;
    include?: Prisma.RackInclude<ExtArgs> | null;
    where: Prisma.RackWhereUniqueInput;
};
export type RackFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RackSelect<ExtArgs> | null;
    omit?: Prisma.RackOmit<ExtArgs> | null;
    include?: Prisma.RackInclude<ExtArgs> | null;
    where: Prisma.RackWhereUniqueInput;
};
export type RackFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RackSelect<ExtArgs> | null;
    omit?: Prisma.RackOmit<ExtArgs> | null;
    include?: Prisma.RackInclude<ExtArgs> | null;
    where?: Prisma.RackWhereInput;
    orderBy?: Prisma.RackOrderByWithRelationInput | Prisma.RackOrderByWithRelationInput[];
    cursor?: Prisma.RackWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RackScalarFieldEnum | Prisma.RackScalarFieldEnum[];
};
export type RackFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RackSelect<ExtArgs> | null;
    omit?: Prisma.RackOmit<ExtArgs> | null;
    include?: Prisma.RackInclude<ExtArgs> | null;
    where?: Prisma.RackWhereInput;
    orderBy?: Prisma.RackOrderByWithRelationInput | Prisma.RackOrderByWithRelationInput[];
    cursor?: Prisma.RackWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RackScalarFieldEnum | Prisma.RackScalarFieldEnum[];
};
export type RackFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RackSelect<ExtArgs> | null;
    omit?: Prisma.RackOmit<ExtArgs> | null;
    include?: Prisma.RackInclude<ExtArgs> | null;
    where?: Prisma.RackWhereInput;
    orderBy?: Prisma.RackOrderByWithRelationInput | Prisma.RackOrderByWithRelationInput[];
    cursor?: Prisma.RackWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RackScalarFieldEnum | Prisma.RackScalarFieldEnum[];
};
export type RackCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RackSelect<ExtArgs> | null;
    omit?: Prisma.RackOmit<ExtArgs> | null;
    include?: Prisma.RackInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.RackCreateInput, Prisma.RackUncheckedCreateInput>;
};
export type RackCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.RackCreateManyInput | Prisma.RackCreateManyInput[];
    skipDuplicates?: boolean;
};
export type RackCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RackSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.RackOmit<ExtArgs> | null;
    data: Prisma.RackCreateManyInput | Prisma.RackCreateManyInput[];
    skipDuplicates?: boolean;
};
export type RackUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RackSelect<ExtArgs> | null;
    omit?: Prisma.RackOmit<ExtArgs> | null;
    include?: Prisma.RackInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.RackUpdateInput, Prisma.RackUncheckedUpdateInput>;
    where: Prisma.RackWhereUniqueInput;
};
export type RackUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.RackUpdateManyMutationInput, Prisma.RackUncheckedUpdateManyInput>;
    where?: Prisma.RackWhereInput;
    limit?: number;
};
export type RackUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RackSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.RackOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.RackUpdateManyMutationInput, Prisma.RackUncheckedUpdateManyInput>;
    where?: Prisma.RackWhereInput;
    limit?: number;
};
export type RackUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RackSelect<ExtArgs> | null;
    omit?: Prisma.RackOmit<ExtArgs> | null;
    include?: Prisma.RackInclude<ExtArgs> | null;
    where: Prisma.RackWhereUniqueInput;
    create: Prisma.XOR<Prisma.RackCreateInput, Prisma.RackUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.RackUpdateInput, Prisma.RackUncheckedUpdateInput>;
};
export type RackDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RackSelect<ExtArgs> | null;
    omit?: Prisma.RackOmit<ExtArgs> | null;
    include?: Prisma.RackInclude<ExtArgs> | null;
    where: Prisma.RackWhereUniqueInput;
};
export type RackDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RackWhereInput;
    limit?: number;
};
export type Rack$ativosArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AtivoSelect<ExtArgs> | null;
    omit?: Prisma.AtivoOmit<ExtArgs> | null;
    include?: Prisma.AtivoInclude<ExtArgs> | null;
    where?: Prisma.AtivoWhereInput;
    orderBy?: Prisma.AtivoOrderByWithRelationInput | Prisma.AtivoOrderByWithRelationInput[];
    cursor?: Prisma.AtivoWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.AtivoScalarFieldEnum | Prisma.AtivoScalarFieldEnum[];
};
export type RackDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RackSelect<ExtArgs> | null;
    omit?: Prisma.RackOmit<ExtArgs> | null;
    include?: Prisma.RackInclude<ExtArgs> | null;
};
